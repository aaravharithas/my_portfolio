import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePortfolio, projectLayout, mediaUrl } from '../lib/portfolio-data.ts';
import { dateParts, compactRange, yearRange } from '../lib/dates.ts';
import { safeUrl } from '../lib/navigation.ts';

const project = { title: 'Example', image: 'https://portfolioapi.pythonanywhere.com/media/project.webp', github: 'https://github.com/example/repo', link: 'https://example.com', tech_stack: ['Python', 'Python', 'Django', null] };
const base = { name: 'Test Developer', firstName: 'Test', lastName: 'Developer', email: 'test@example.com', aboutMe: 'I am manily focused on Python.', social: { twitter: 'https://twitter.com/', linkedin: 'https://linkedin.com/in/test/' }, projects: [project] };

test('normalization discards private data and corrects the introduction for display', () => {
  const result = normalizePortfolio({ ...base, dob: 'PRIVATE_DOB', address: 'PRIVATE_ADDRESS', zipCode: 'PRIVATE_ZIP', phone: 'PRIVATE_PHONE' });
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_/);
  for (const key of ['dob', 'address', 'zipCode', 'phone']) assert.equal(key in result, false);
  assert.match(result.aboutMe, /mainly/);
  assert.equal(result.navigation.email, base.email);
  assert.equal(result.twitter, '');
  assert.equal(result.navigation.links.find(item => item.label === 'GitHub').href, project.github);
  assert.deepEqual(result.projects[0].tech_stack, ['Python', 'Django']);
});

test('dates use deterministic UTC calendar parsing with Present and leap-year support', () => {
  assert.deepEqual(dateParts('April 8, 2025'), { year: 2025, month: 3, day: 8 });
  assert.deepEqual(dateParts('2025-04-08'), { year: 2025, month: 3, day: 8 });
  assert.equal(compactRange('July 1, 2025', 'Present'), '2025 — Now');
  assert.equal(compactRange('August 1, 2023', 'October 31, 2023'), 'Aug–Oct 2023');
  assert.equal(compactRange('April 8, 2025', 'April 30, 2025'), 'Apr 2025');
  assert.equal(compactRange('September 24, 2021', 'July 7, 2024'), '2021 — 2024');
  assert.equal(yearRange('April 8, 2025', 'November 8, 2025'), '2025');
  assert.equal(yearRange('September 24, 2021', 'July 7, 2024'), '2021 — 2024');
  assert.deepEqual(dateParts('February 29, 2024'), { year: 2024, month: 1, day: 29 });
  for (const input of ['February 29, 2025', '2025-13-02', 'not a date', '']) assert.equal(dateParts(input), null);
  assert.equal(compactRange('', ''), '');
});

test('links reject executable protocols, credentials and bare social homepages', () => {
  for (const input of ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com/path', null]) assert.equal(safeUrl(input), null);
  for (const input of ['https://twitter.com/', 'https://twitter.com/?handle=test', 'https://twitter.com/#user']) assert.equal(safeUrl(input, true), null);
  assert.equal(safeUrl('https://twitter.com/test', true), 'https://twitter.com/test');
  assert.equal(mediaUrl('https://example.com/media/test.jpg'), '');
  assert.equal(mediaUrl('https://portfolioapi.pythonanywhere.com/admin/'), '');
});

test('skills ignore category, sort by proficiency and reject malformed numbers', () => {
  const result = normalizePortfolio({ ...base, skills: [{ name: 'Low', value: 50 }, { name: 'High', value: 90, category: null }, { name: 'Boundary', value: 80 }, { name: 'Bad', value: '90' }, { name: 'NaN', value: NaN }, { name: 'Clamp', value: 150 }] });
  assert.deepEqual(result.skills.map(item => [item.name, item.value]), [['Clamp', 100], ['High', 90], ['Boundary', 80], ['Low', 50]]);
  assert.equal(result.skills.every(item => item.category === null), true);
});

test('project layout adapts to 0, 1, 2, 3 and more projects', () => {
  for (const [count, expected] of [[0, 'feature'], [1, 'feature'], [2, 'pair'], [3, 'bento'], [8, 'bento']]) {
    const data = normalizePortfolio({ ...base, projects: Array.from({ length: count }, (_, i) => ({ ...project, title: `Project ${i}` })) });
    assert.equal(projectLayout(data.projects.length), expected);
  }
});

test('education is ordered by recency and malformed optional collections are safe', () => {
  const result = normalizePortfolio({ ...base, education: [{ degree: 'Old', endDate: 'July 7, 2024' }, { degree: 'Current', endDate: 'Present' }, { degree: 'Recent', endDate: 'November 8, 2025' }], projects: null, experience: 'invalid', skills: [null, {}] });
  assert.deepEqual(result.education.map(item => item.degree), ['Current', 'Recent', 'Old']);
  assert.deepEqual(result.projects, []);
  assert.deepEqual(result.skills, []);
  assert.deepEqual(result.experience, []);
  assert.throws(() => normalizePortfolio({ name: 123 }));
});
