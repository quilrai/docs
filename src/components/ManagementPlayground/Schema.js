import React from 'react';
import { resolveRef } from './spec.mjs';
import styles from './styles.module.css';

function typeName(spec, original) {
  const schema = resolveRef(spec, original) || {};
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.oneOf) return `one of ${schema.oneOf.length}`;
  if (schema.anyOf) return schema.anyOf.map((s) => typeName(spec, s)).join(' | ');
  if (schema.type === 'array') return `array<${typeName(spec, schema.items)}>`;
  if (schema.type === 'object' && schema.additionalProperties && !schema.properties) {
    return `map<string, ${typeof schema.additionalProperties === 'object' ? typeName(spec, schema.additionalProperties) : 'any'}>`;
  }
  const t = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type || (schema.properties ? 'object' : 'any');
  return schema._refName && t === 'object' ? schema._refName : t;
}

function Constraints({ schema }) {
  const parts = [];
  for (const [key, label] of [
    ['minLength', 'min length'],
    ['maxLength', 'max length'],
    ['minimum', 'min'],
    ['maximum', 'max'],
    ['exclusiveMinimum', 'greater than'],
    ['minItems', 'min items'],
    ['maxItems', 'max items'],
    ['format', 'format'],
    ['pattern', 'pattern'],
  ]) {
    if (schema[key] !== undefined && typeof schema[key] !== 'object') parts.push(`${label}: ${schema[key]}`);
  }
  if (schema.uniqueItems) parts.push('unique items');
  if (schema.readOnly) parts.push('read only');
  if (schema.writeOnly) parts.push('write only');
  if (schema.nullable) parts.push('nullable');
  if (schema.default !== undefined) parts.push(`default: ${JSON.stringify(schema.default)}`);
  if (Array.isArray(schema.enum)) parts.push(`one of: ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`);
  return parts.length ? (
    <div className={styles.constraints}>
      {parts.map((p) => (
        <span key={p}>{p}</span>
      ))}
    </div>
  ) : null;
}

function Nested({ spec, schema, depth }) {
  if (depth > 8) return null;
  const variants = schema.oneOf || schema.anyOf;
  if (variants) {
    return (
      <div className={styles.variants}>
        {variants.map((variant, i) => {
          const v = resolveRef(spec, variant) || {};
          if (v.type === 'null') return null;
          return (
            <details key={i} className={styles.nestedSchema}>
              <summary>
                {v.title || v._refName || `Variant ${i + 1}`} <span>{typeName(spec, v)}</span>
              </summary>
              <SchemaTree spec={spec} schema={v} depth={depth + 1} />
            </details>
          );
        })}
      </div>
    );
  }
  const items = schema.type === 'array' ? resolveRef(spec, schema.items) : null;
  const map =
    schema.additionalProperties && typeof schema.additionalProperties === 'object' && !schema.properties
      ? resolveRef(spec, schema.additionalProperties)
      : null;
  const inner = items || map || (schema.properties ? schema : null);
  if (!inner || (!inner.properties && !inner.oneOf && !inner.anyOf && !(inner.type === 'array'))) return null;
  return (
    <details className={styles.nestedSchema}>
      <summary>{items ? 'Array items' : map ? 'Map values' : 'Fields'}</summary>
      <SchemaTree spec={spec} schema={inner} depth={depth + 1} />
    </details>
  );
}

export default function SchemaTree({ spec, schema: original, depth = 0 }) {
  const schema = resolveRef(spec, original);
  if (!schema) return <p className={styles.muted}>No schema published.</p>;
  if (schema.oneOf || schema.anyOf) return <Nested spec={spec} schema={schema} depth={depth} />;
  if (!schema.properties) {
    return (
      <div className={styles.schemaScalar}>
        <code>{typeName(spec, schema)}</code>
        {schema.description && <p>{schema.description}</p>}
        <Constraints schema={schema} />
        <Nested spec={spec} schema={schema} depth={depth} />
      </div>
    );
  }
  const required = schema.required || [];
  return (
    <div className={styles.schemaFields}>
      {Object.entries(schema.properties).map(([name, raw]) => {
        const prop = resolveRef(spec, raw) || {};
        const isRequired = required.includes(name);
        return (
          <div className={styles.schemaField} key={name}>
            <div className={styles.schemaFieldTitle}>
              <code>{name}</code>
              <span className={styles.schemaType}>{typeName(spec, prop)}</span>
              <span className={isRequired ? styles.req : styles.opt}>{isRequired ? 'required' : 'optional'}</span>
            </div>
            {prop.description && <p>{prop.description}</p>}
            <Constraints schema={prop} />
            {depth < 8 && <Nested spec={spec} schema={prop} depth={depth} />}
          </div>
        );
      })}
      {schema.additionalProperties === false && <p className={styles.muted}>Unknown fields are rejected.</p>}
    </div>
  );
}
