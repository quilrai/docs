import React, {useId, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {ArrowUpRight, BookOpen, Download, KeyRound, Layers, Search, ShieldCheck, SlidersHorizontal, Terminal, Workflow} from 'lucide-react';
import spec from '@site/static/openapi/llm-gateway-management-v1.json';
import styles from './styles.module.css';

const base = '/llmgateway/management/v1';
const adminBase = '/llmgateway/management-admin/v1';
const download = '/openapi/llm-gateway-management-v1.json';
const pageFor = {Apps:'apps', Providers:'providers', Credentials:'credentials', Administration:'authentication', Policy:'policy', Prompts:'prompts', Catalogs:'catalogs-and-history', History:'catalogs-and-history', Reference:'conventions'};
const operations = Object.entries(spec.paths).flatMap(([path, methods]) => Object.entries(methods).map(([method, op]) => ({...op, path, method:method.toUpperCase()})));
const resolve = (schema = {}) => schema.$ref ? {...spec.components.schemas[schema.$ref.split('/').pop()], ...Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$ref'))} : schema;
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

export function ManagementHero() {
  return <section className={styles.hero}>
    <div className={styles.eyebrow}><span className={styles.dot} /> LLM GATEWAY / MANAGEMENT V1</div>
    <h2>Configure your gateway.<br/><span>Keep every change intentional.</span></h2>
    <p>Manage apps, shared providers, access keys and policy from one tenant-scoped API. Start with a workflow, then explore every request field.</p>
    <div className={styles.heroActions}><Link className={styles.primaryLink} to="./quick-start">Start with an example <ArrowUpRight size={16}/></Link><a className={styles.downloadLink} href={download} download><Download size={16}/> OpenAPI reference</a></div>
    <div className={styles.heroFacts}><span><ShieldCheck size={16}/> Tenant-bound keys</span><span><SlidersHorizontal size={16}/> Explicit scopes</span><span><Workflow size={16}/> Central configuration</span></div>
  </section>;
}

export function ResourceCards() {
  const cards = [
    ['Apps','Create, read, configure and pause applications.','apps',Layers],
    ['Providers','Share credentials, attach models and test connections.','providers',SlidersHorizontal],
    ['Authentication','Enable access and issue scoped management keys.','authentication',ShieldCheck],
    ['Gateway credentials','Issue, reveal, expire and revoke app keys.','credentials',KeyRound],
    ['QuilrQL policy','Preview, validate, simulate and publish revisions.','policy',Workflow],
    ['Prompts & catalogs','Manage prompt content and use existing definitions.','prompts',BookOpen],
  ];
  return <nav className={styles.cards} aria-label="Management API resources">{cards.map(([title,desc,page,Icon])=><Link to={'./'+page} className={styles.card} key={page}><div className={styles.cardTop}><Icon size={21}/><ArrowUpRight size={17}/></div><strong>{title}</strong><p>{desc}</p><span>Explore reference</span></Link>)}</nav>;
}

export function Method({method}) {return <span className={`${styles.method} ${styles[method.toLowerCase()] || ''}`}>{method}</span>;}

export function EndpointDirectory() {
  const [search,setSearch]=useState('');
  const [tag,setTag]=useState('All resources');
  const id=useId();
  const filtered=operations.filter(op=>(tag==='All resources'||op.tags.includes(tag)) && `${op.summary} ${op.path} ${op.method}`.toLowerCase().includes(search.toLowerCase()));
  return <section className={styles.directory} aria-label="Search API endpoints">
    <div className={styles.directoryTools}><label className={styles.search}><Search size={17}/><span className={styles.srOnly}>Search endpoints</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find an endpoint..."/></label><label htmlFor={id} className={styles.srOnly}>Resource</label><select id={id} value={tag} onChange={e=>setTag(e.target.value)}>{['All resources',...spec.tags.map(t=>t.name)].map(t=><option key={t}>{t}</option>)}</select></div>
    <p className={styles.resultCount} role="status">{filtered.length} of {operations.length} operations</p>
    <div className={styles.endpointRows}>{filtered.map(op=><Link key={op.operationId} className={styles.endpointRow} to={`./${pageFor[op.tags[0]]}#${op.operationId}`}><Method method={op.method}/><div><code>{op.path.replace(adminBase,'/admin').replace(base,'')}</code><span>{op.summary}</span></div><ArrowUpRight size={16}/></Link>)}</div>
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
    return <details key={i} className={styles.nested}><summary>{v.title || (variant.$ref ? variant.$ref.split('/').pop() : `Variant ${i+1}`)} <span>{typeName(v)}</span></summary><SchemaFields schema={v} depth={depth+1}/></details>;
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

export function SchemaReference({name}) {
  const schema=spec.components.schemas[name];
  return <section className={styles.schemaPanel}><div className={styles.schemaTitle}><span>INPUT SCHEMA</span><code>{name}</code></div>{schema.description&&<p className={styles.schemaIntro}>{schema.description}</p>}<SchemaFields schema={schema}/></section>;
}

function curlFor(op,body) {
  let path=op.path;
  op.parameters.filter(p=>p.in==='path').forEach(p=>{path=path.replace('{'+p.name+'}',encodeURIComponent(p.example ?? 'example'));});
  const queries=op.parameters.filter(p=>p.in==='query'&&(p.required || p.name==='limit')).map(p=>`${p.name}=${encodeURIComponent(p.example ?? 'example')}`);
  const lines=[`curl --request ${op.method} \\`, `  'https://management.example.com${path}${queries.length?'?'+queries.join('&'):''}' \\`, `  --header 'Authorization: Bearer ${op.tags.includes('Administration')?'<verified-admin-token>':'<management-key>'}'`];
  op.parameters.filter(p=>p.in==='header'&&(p.required||p.name==='If-Match')).forEach(p=>{lines[lines.length-1]+=' \\';lines.push(`  --header '${p.name}: ${p.example ?? '*'}'`);});
  if(body !== undefined){lines[lines.length-1]+=' \\';lines.push("  --header 'Content-Type: application/json' \\");lines.push("  --data '"+print(body).replace(/'/g,"'\\''")+"'");}
  return lines.join('\n');
}

function Operation({op}) {
  useBrokenLinks().collectAnchor(op.operationId);
  const [tab,setTab]=useState('cURL');
  const content=op.requestBody?.content?.['application/json'];
  const examples=content?.examples ? Object.entries(content.examples).map(([name,e])=>[name,e.value]) : [['Example',content?.example]];
  const [selected,setSelected]=useState(examples[0][0]);
  const chosen=examples.find(([name])=>name===selected)?.[1];
  const success=Object.entries(op.responses).find(([status])=>status.startsWith('2'));
  const response=success?.[1]?.content?.['application/json']?.example;
  const tabs=['cURL',...(content?['JSON body']:[]),'Response'];
  const parameterSchema=objFromParameters(op.parameters);
  return <article className={styles.operation} id={op.operationId}>
    <header className={styles.operationHeader}><div className={styles.operationPath}><Method method={op.method}/><code>{op.path.replace(adminBase,'/admin').replace(base,'')}</code></div><h3><a href={'#'+op.operationId}>{op.summary}</a></h3><p>{op.description}</p><div className={styles.scopeRow}><span>REQUIRES</span>{op['x-scopes'].length ? op['x-scopes'].map(scope=><code key={scope}>{scope}</code>) : <code>Verified tenant admin / Quilr operator</code>}</div></header>
    <div className={styles.operationBody}>
      {op.parameters.length>0&&<details className={styles.parameterPanel}><summary>Path, query &amp; header parameters <span>{op.parameters.length}</span></summary><SchemaFields schema={parameterSchema}/></details>}
      {content ? <details className={styles.parameterPanel}><summary>Full request body specification <span>application/json</span></summary><p className={styles.schemaIntro}>{resolve(content.schema).description}</p><SchemaFields schema={content.schema}/></details> : <p className={styles.noBody}>No request body.</p>}
      <div className={styles.exampleBar}><div className={styles.tabs} aria-label="Example format">{tabs.map(t=><button type="button" aria-pressed={tab===t} className={tab===t?styles.activeTab:''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>{examples.length>1&&<label><span className={styles.srOnly}>Request example for {op.summary}</span><select value={selected} onChange={e=>setSelected(e.target.value)}>{examples.map(([name])=><option key={name}>{name}</option>)}</select></label>}</div>
      <div className={styles.codeExample}><CodeBlock language={tab==='cURL'?'bash':'json'} title={tab==='Response'?`${success[0]} response example`:undefined}>{tab==='cURL'?curlFor(op,chosen):tab==='JSON body'?print(chosen):response?print(response):'// 204 No Content'}</CodeBlock></div>
      <p className={styles.operationFoot}><Terminal size={13}/> <Link to="./conventions">Authentication, errors &amp; retry rules</Link></p>
    </div>
  </article>;
}

function objFromParameters(parameters) {
  return {type:'object',properties:Object.fromEntries(parameters.map(p=>[`${p.name} (${p.in})`,{...p.schema,description:p.description||p.schema.description}])),required:parameters.filter(p=>p.required).map(p=>`${p.name} (${p.in})`)};
}

export function ApiReference({tags}) {
  const list=useMemo(()=>operations.filter(op=>op.tags.some(t=>tags.includes(t))),[tags.join(',')]);
  return <div className={styles.reference}>{list.map(op=><Operation key={op.operationId} op={op}/>)}</div>;
}
