import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePortfolio, readPortfolioCache, savePortfolioCache, portfolioCacheKey } from '../src/utils/portfolioData.js';

test('normalizes malformed nested data without leaking unrenderable fields', () => {
  const data = normalizePortfolio({ name: ' Test ', title: {}, skills: [{name: 123}, {name:' Python '}],
    projects: [{title:'Demo', tech_stack:['JS', {}, null], image:'javascript:alert(1)', link:'https://example.com', imageFit:'invalid'}, {title: {}}, {title:'Hidden', status:'draft'}],
    education:[{degree:'Course', startDate:'bad date', endDate:'Present'}], social: { twitter:'https://twitter.com/', github:'https://github.com/test' } });
  assert.equal(data.name,'Test'); assert.equal(data.title,'');
  assert.deepEqual(data.skills,[{name:'Python',category:''}]);
  assert.equal(data.projects.length,1); assert.deepEqual(data.projects[0].tech_stack,['JS']);
  assert.equal(data.projects[0].image,''); assert.equal(data.projects[0].imageFit,'contain');
  assert.equal(data.education[0].startDate,''); assert.equal(data.education[0].endDate,'Present');
  assert.deepEqual(data.social,{github:'https://github.com/test'});
  assert.deepEqual(data.experience,[]);
});
test('rejects invalid response roots and collections; absent fields do not inherit bundled content', () => {
  for (const value of [null, [], {}, {name:12}, {name:'Test',skills:{}}]) assert.throws(() => normalizePortfolio(value));
  const data = normalizePortfolio({name:'Someone Else'});
  assert.equal(data.firstName,''); assert.equal(data.email,''); assert.deepEqual(data.projects,[]);
});
test('persists validated snapshots by source and ignores corrupt, future, or incompatible caches', () => {
  const values=new Map(); const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  savePortfolioCache(storage,'one',{name:'Saved',skills:[{name:3}]},100);
  assert.equal(readPortfolioCache(storage,'one',200).data.name,'Saved');
  assert.deepEqual(readPortfolioCache(storage,'one',200).data.skills,[]);
  assert.equal(readPortfolioCache(storage,'two',200),null);
  assert.equal(readPortfolioCache(storage,'one',50),null);
  for(const value of ['broken','null',JSON.stringify({version:2,fetchedAt:100,data:{name:'Saved'}})]) {
    values.set(portfolioCacheKey('one'),value); assert.equal(readPortfolioCache(storage,'one',200),null);
  }
  assert.equal(readPortfolioCache(null,'one'),null); assert.doesNotThrow(()=>savePortfolioCache(null,'one',{name:'Saved'}));
});
