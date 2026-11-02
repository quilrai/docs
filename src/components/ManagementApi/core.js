import React, {useId, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {ArrowUpRight, Search} from 'lucide-react';
import styles from './styles.module.css';

/*
 * The API reference components, built for one OpenAPI document.
 *
 *   createApiReference(config) -> {ManagementHero, ResourceCards, EndpointDirectory, ApiReference, SchemaReference, Method}
 *
 * index.js builds them for the Management API (the default, unchanged markup) and
 * inference.js for the Inference API. Each entry file imports its own spec, so a
 * page bundles only the spec it renders.
 *
 * config (every hook is optional unless noted):
 *   spec                       the OpenAPI document (required)
 *   hero                       {eyebrow, title, subtitle, text, actions: [{label, to|href, Icon, primary, download}], facts: [{label, Icon}]}
 *   cards                      [{title, desc, to, Icon, footer}] (ResourceCards); a function receives the operations
 *   cardsLabel                 aria-label of the cards nav
 *   aliasOf(op)                key of the canonical operation an alias duplicates, or a falsy value
 *   opKey(op)                  key an alias points at (default operationId)
 *   shortPath(path)            path as displayed
 *   filters                    [{label, value, options: [{label, value}]}] select options for the directory, or omitted for tags
 *   matchFilter(op, value)     true when op belongs to the selected directory filter
 *   allLabel                   first select option (default 'All resources')
 *   searchText(op, aliases)    text the directory search matches
 *   directoryNote({aliasCount}) appended to the result count
 *   rowExtra(op, aliases)      extra element in a directory row
 *   href(op)                   directory row link (required)
 *   description(op)            the operation description element (default: one <p>)
 *   requirements(op)           the requirement row element (required)
 *   aliasNote(op, aliases)     element under the header when aliases exist
 *   curl(op, body)             cURL text (required)
 *   examples(op, content)      [[name, value]] request examples; default the media type's examples/example
 *   requestContent(op)         [mediaType, content] of the documented request body; default application/json only
 *   tabs(op)                   example tab names override
 *   tabCode(op, tab, ctx)      {language, code, title} for a tab override
 *   responsesPanel             true renders every response (status, headers, schema)
 *   lazyPanels                 true renders parameter, body and response panels on first open
 *   headerHref(name)           link for a response header name in the responses panel
 *   footer(op)                 the line under the example (required)
 *   select(op, {tags, paths, family})  ApiReference filter override
 */
export function createApiReference(config) {
  const {spec} = config;
  const allOperations = Object.entries(spec.paths).flatMap(([path, methods]) => Object.entries(methods).map(([method, op]) => ({...op, path, method:method.toUpperCase()})));
  const aliasOf = config.aliasOf || (() => null);
  const opKey = config.opKey || (op => op.operationId);
  // Aliases duplicate a canonical operation; list each operation once.
  const operations = allOperations.filter(op => !aliasOf(op));
  const aliasesFor = {};
  for (const op of allOperations) {
    const target = aliasOf(op);
    if (target) (aliasesFor[target] ||= []).push(op);
  }
  const aliasCount = allOperations.length - operations.length;
  const aliasesOf = op => aliasesFor[opKey(op)] || [];
  const shortPath = config.shortPath || (path => path);
  const refName = ref => ref.split('/').pop();
  const resolve = (schema = {}) => schema.$ref ? {...spec.components.schemas[refName(schema.$ref)], ...Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$ref'))} : schema;
  const resolveIn = (kind, value = {}) => value.$ref ? spec.components[kind][refName(value.$ref)] || {} : value;
  const print = value => JSON.stringify(value, null, 2);
  const typeName = original => {
    const schema = resolve(original);
    if (schema.const !== undefined) return JSON.stringify(schema.const);
    if (schema.oneOf) return 'one of '+schema.oneOf.length+' variants';
    if (schema.anyOf) return schema.anyOf.map(typeName).join(' | ');
    if (schema.type === 'array') return 'array<'+typeName(schema.items)+'>';
    if (schema.type === 'object' && schema.additionalProperties && !schema.properties) return 'map<string, '+typeName(schema.additionalProperties)+'>';
    return Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type || 'object';
  };

  function ManagementHero() {
    const hero = config.hero;
    return <section className={styles.hero}>
      <div className={styles.eyebrow}><span className={styles.dot} />{' '+hero.eyebrow}</div>
      <h2>{hero.title}<br/><span>{hero.subtitle}</span></h2>
      <p>{hero.text}</p>
      <div className={styles.heroActions}>{hero.actions.map(({label, to, href, Icon, primary, download}) => primary
        ? <Link key={label} className={styles.primaryLink} to={to}>{label+' '}<ArrowUpRight size={16}/></Link>
        : href ? <a key={label} className={styles.downloadLink} href={href} download={download || undefined}><Icon size={16}/>{' '+label}</a>
          : <Link key={label} className={styles.downloadLink} to={to}><Icon size={16}/>{' '+label}</Link>)}</div>
      <div className={styles.heroFacts}>{hero.facts.map(({label, Icon}) => <span key={label}><Icon size={16}/>{' '+label}</span>)}</div>
    </section>;
  }

  function ResourceCards() {
    const cards = typeof config.cards === 'function' ? config.cards(operations) : config.cards;
    return <nav className={styles.cards} aria-label={config.cardsLabel}>{cards.map(({title,desc,to,Icon,footer})=><Link to={to} className={styles.card} key={to}><div className={styles.cardTop}><Icon size={21}/><ArrowUpRight size={17}/></div><strong>{title}</strong><p>{desc}</p><span>{footer || 'Explore reference'}</span></Link>)}</nav>;
  }

  function Method({method}) {return <span className={`${styles.method} ${styles[method.toLowerCase()] || ''}`}>{method}</span>;}

  const allLabel = config.allLabel || 'All resources';
  const matchFilter = config.matchFilter || ((op, value) => op.tags.includes(value));
  const searchText = config.searchText || (op => `${op.summary} ${op.path} ${op.method} ${op.tags.join(' ')}`);

  function EndpointDirectory() {
    const [search,setSearch]=useState('');
    const [tag,setTag]=useState(allLabel);
    const id=useId();
    const filtered=operations.filter(op=>(tag===allLabel||matchFilter(op, tag)) && searchText(op, aliasesOf(op)).toLowerCase().includes(search.toLowerCase()));
    const options=config.filters
      ? [<option key={allLabel}>{allLabel}</option>, ...config.filters.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)]
      : [allLabel,...spec.tags.map(t=>t.name)].map(t=><option key={t}>{t}</option>);
    return <section className={styles.directory} aria-label="Search API endpoints">
      <div className={styles.directoryTools}><label className={styles.search}><Search size={17}/><span className={styles.srOnly}>Search endpoints</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find an endpoint..."/></label><label htmlFor={id} className={styles.srOnly}>Resource</label><select id={id} value={tag} onChange={e=>setTag(e.target.value)}>{options}</select></div>
      <p className={styles.resultCount} role="status">{filtered.length} of {operations.length} operations{config.directoryNote?.({aliasCount})}</p>
      <div className={styles.endpointRows}>{filtered.map(op=><Link key={op.operationId} className={styles.endpointRow} to={config.href(op)}><Method method={op.method}/><div><code>{shortPath(op.path)}</code><span>{op.summary}</span>{config.rowExtra?.(op, aliasesOf(op))}</div><ArrowUpRight size={16}/></Link>)}</div>
      {!filtered.length && <div className={styles.empty}>No matching endpoints. Try a resource name, HTTP method or path.</div>}
    </section>;
  }

  function Constraints({schema}) {
    const parts=[];
    for (const [key,label] of [['minLength','min length'],['maxLength','max length'],['minimum','min'],['maximum','max'],['exclusiveMinimum','greater than'],['minItems','min items'],['maxItems','max items'],['minProperties','min fields'],['format','format'],['pattern','pattern']]) {
      if (schema[key] !== undefined) parts.push(`${label}: ${schema[key]}`);
    }
    if (schema.uniqueItems) parts.push('unique items');
    if (schema.writeOnly) parts.push('write only');
    if (schema.default !== undefined) parts.push('default: '+JSON.stringify(schema.default));
    return parts.length ? <div className={styles.constraints}>{parts.map(p=><span key={p}>{p}</span>)}</div> : null;
  }

  function NestedSchema({schema,depth}) {
    if (schema.oneOf || schema.anyOf) return <div className={styles.variants}>{(schema.oneOf||schema.anyOf).map((variant,i)=>{
      const v=resolve(variant);
      if(v.type==='null') return <p className={styles.nullNote} key={i}>Also accepts <code>null</code>.</p>;
      return <details key={i} className={styles.nested}><summary>{v.title || (variant.$ref ? refName(variant.$ref) : `Variant ${i+1}`)} <span>{typeName(v)}</span></summary><SchemaFields schema={v} depth={depth+1}/></details>;
    })}</div>;
    const nested=schema.type==='array' ? resolve(schema.items) : schema.additionalProperties && typeof schema.additionalProperties==='object' ? resolve(schema.additionalProperties) : schema;
    if (nested.properties || nested.oneOf || nested.anyOf || schema.type==='array' || (schema.additionalProperties && typeof schema.additionalProperties==='object')) return <details className={styles.nested}><summary>{schema.type==='array' ? 'Array item specification' : schema.additionalProperties && !schema.properties ? 'Map value specification' : 'Object fields'}</summary><SchemaFields schema={nested} depth={depth+1}/></details>;
    return null;
  }

  function SchemaFields({schema:original,depth=0}) {
    const schema=resolve(original);
    if (schema.oneOf||schema.anyOf) return <NestedSchema schema={schema} depth={depth}/>;
    if (!schema.properties) return <div className={styles.scalar}><code>{typeName(schema)}</code>{schema.description&&<p>{schema.description}</p>}<Constraints schema={schema}/>{schema.enum&&<p>Values: {schema.enum.map(v=><code className={styles.enumValue} key={v}>{JSON.stringify(v)}</code>)}</p>}</div>;
    return <div className={styles.fields}>
      {Object.entries(schema.properties).map(([name,originalProp])=>{
        const prop=resolve(originalProp);
        return <div className={styles.field} key={name}><div className={styles.fieldTitle}><code>{name}</code><span className={styles.fieldType}>{typeName(prop)}</span><span className={schema.required?.includes(name)?styles.required:styles.optional}>{schema.required?.includes(name)?'required':'optional'}</span></div>{prop.description&&<p>{prop.description}</p>}<Constraints schema={prop}/>{prop.enum&&<div className={styles.enums}>{prop.enum.map(value=><code key={value}>{JSON.stringify(value)}</code>)}</div>}<NestedSchema schema={prop} depth={depth}/></div>;
      })}
      {schema.additionalProperties===false && <p className={styles.closedObject}>Unknown fields are rejected in this object.</p>}
      {schema.allOf && <details className={styles.nested}><summary>Conditional requirements</summary><CodeBlock language="json">{print(schema.allOf)}</CodeBlock></details>}
    </div>;
  }

  function SchemaReference({name}) {
    const schema=spec.components.schemas[name];
    return <section className={styles.schemaPanel}><div className={styles.schemaTitle}><span>INPUT SCHEMA</span><code>{name}</code></div>{schema.description&&<p className={styles.schemaIntro}>{schema.description}</p>}<SchemaFields schema={schema}/></section>;
  }

  const requestContent = config.requestContent || (op => ['application/json', op.requestBody?.content?.['application/json']]);
  const defaultExamples = content => content?.examples ? Object.entries(content.examples).map(([name,e])=>[name,e.value]) : [['Example',content?.example]];

  // lazyPanels: render a panel's contents on first open, which keeps a page with
  // many large operations light. Without it a panel is a plain <details>.
  function LazyPanel({className, summary, children}) {
    const [opened,setOpened]=useState(false);
    return <details className={className} onToggle={e=>{if(e.currentTarget.open) setOpened(true);}}>{summary}{opened&&children}</details>;
  }
  const Panel = config.lazyPanels ? LazyPanel : ({className, summary, children}) => <details className={className}>{summary}{children}</details>;

  function Responses({op}) {
    const entries=Object.entries(op.responses);
    return <Panel className={styles.parameterPanel} summary={<summary>Responses <span>{entries.map(([status])=>status).join(' · ')}</span></summary>}><div className={styles.responseList}>{entries.map(([status,raw])=>{
      const response=resolveIn('responses', raw);
      const media=Object.entries(response.content || {});
      const headers=Object.keys(response.headers || {});
      const schemaOf=([,c])=>c.schema;
      const shown=media.filter(schemaOf);
      return <div className={styles.responseItem} key={status}>
        <div className={styles.responseTitle}><span className={`${styles.status} ${styles['status'+status[0]] || ''}`}>{status}</span>{media.map(([type])=><code key={type}>{type}</code>)}</div>
        {response.description&&<p>{response.description}</p>}
        {headers.length>0&&<div className={styles.headerList}><span>HEADERS</span>{headers.map(h=>{const href=config.headerHref?.(h); return href ? <Link key={h} to={href}><code>{h}</code></Link> : <code key={h}>{h}</code>;})}</div>}
        {status.startsWith('2') && shown.map(([type,c])=><details className={styles.nested} key={type}><summary>Body <span>{type}</span></summary><SchemaFields schema={c.schema}/></details>)}
        {!status.startsWith('2') && shown.length>0 && <p className={styles.responseRef}>Body: {[...new Set(shown.map(([,c])=>c.schema.$ref ? refName(c.schema.$ref) : typeName(c.schema)))].map(n=><code key={n}>{n}</code>)}</p>}
      </div>;
    })}</div></Panel>;
  }

  function Operation({op}) {
    useBrokenLinks().collectAnchor(op.operationId);
    const [tab,setTab]=useState('cURL');
    const [mediaType,content]=requestContent(op);
    const examples=config.examples ? config.examples(op, content, mediaType) : defaultExamples(content);
    const [selected,setSelected]=useState(examples[0][0]);
    const chosen=examples.find(([name])=>name===selected)?.[1];
    const successes=Object.entries(op.responses).filter(([status])=>status.startsWith('2'));
    const success=successes.find(([,r])=>r.content?.['application/json']?.example!==undefined) || successes[0];
    const response=success?.[1]?.content?.['application/json']?.example;
    const aliases=aliasesOf(op);
    const tabs=config.tabs ? config.tabs(op, {content, mediaType}) : ['cURL',...(content?['JSON body']:[]),'Response'];
    const parameterSchema=objFromParameters(op.parameters);
    const custom=config.tabCode?.(op, tab, {body:chosen, mediaType});
    const code=custom || {language:tab==='cURL'?'bash':'json', title:tab==='Response'&&success?`${success[0]} response example`:undefined, code:tab==='cURL'?config.curl(op,chosen,mediaType):tab==='JSON body'?print(chosen):response?print(response):'// See the response schema for this operation.'};
    const otherTypes=config.requestContent ? Object.keys(op.requestBody?.content || {}).filter(t=>t!==mediaType) : [];
    return <article className={styles.operation} id={op.operationId}>
      <header className={styles.operationHeader}><div className={styles.operationPath}><Method method={op.method}/><code>{shortPath(op.path)}</code></div><h3><a href={'#'+op.operationId}>{op.summary}</a></h3>{config.description ? config.description(op) : <p>{op.description}</p>}{config.requirements(op)}{aliases.length>0&&config.aliasNote?.(op, aliases)}</header>
      <div className={styles.operationBody}>
        {op.parameters.length>0&&<Panel className={styles.parameterPanel} summary={<summary>Path, query &amp; header parameters <span>{op.parameters.length}</span></summary>}><SchemaFields schema={parameterSchema}/></Panel>}
        {content ? <Panel className={styles.parameterPanel} summary={<summary>Full request body specification <span>{mediaType}</span>{otherTypes.length>0&&<span>also {otherTypes.join(', ')}</span>}</summary>}><p className={styles.schemaIntro}>{resolve(content.schema).description}</p><SchemaFields schema={content.schema}/></Panel> : <p className={styles.noBody}>No request body.</p>}
        {config.responsesPanel&&<Responses op={op}/>}
        <div className={styles.exampleBar}><div className={styles.tabs} aria-label="Example format">{tabs.map(t=><button type="button" aria-pressed={tab===t} className={tab===t?styles.activeTab:''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>{examples.length>1&&<label><span className={styles.srOnly}>Request example for {op.summary}</span><select value={selected} onChange={e=>setSelected(e.target.value)}>{examples.map(([name])=><option key={name}>{name}</option>)}</select></label>}</div>
        <div className={styles.codeExample}><CodeBlock language={code.language} title={code.title}>{code.code}</CodeBlock></div>
        {config.footer(op)}
      </div>
    </article>;
  }

  function objFromParameters(parameters) {
    return {type:'object',properties:Object.fromEntries(parameters.map(p=>[`${p.name} (${p.in})`,{...p.schema,description:p.description||p.schema.description}])),required:parameters.filter(p=>p.required).map(p=>`${p.name} (${p.in})`)};
  }

  const select = config.select || ((op, {tags, paths}) => op.tags.some(t=>tags.includes(t)) && (!paths || paths.some(p=>{const rest=shortPath(op.path); return rest===p || rest.startsWith(p+'/') || rest.startsWith(p+':');})));

  // paths: optional path prefixes (after the API base) that narrow the list, so a page can show
  // one collection per section, e.g. paths={['/controls/routes']}. Each operation keeps its operationId anchor.
  function ApiReference({tags, paths, family}) {
    const list=useMemo(()=>operations.filter(op=>select(op, {tags, paths, family})),[(tags||[]).join(','), (paths||[]).join(','), family]);
    return <div className={styles.reference}>{list.map(op=><Operation key={op.operationId} op={op}/>)}</div>;
  }

  return {ManagementHero, ResourceCards, EndpointDirectory, ApiReference, SchemaReference, Method, operations, allOperations, aliasesOf, resolve, resolveIn, typeName, print};
}

