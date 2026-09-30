// Where an item's files live, and where its page is in the app. A prototype is
// src/prototypes/<contributor>/<id>/, at /<contributor>/<id>. The Handbook (src/handbook/) is shown
// the same way, as one tree at /handbook, under the reserved key "handbook". Nobody is the
// "handbook" contributor, so the app never offers to change anything there: those are platform
// files, maintained in the repo.
// This file has no imports, so Node scripts can load it directly.

export const HANDBOOK_KEY = 'handbook';

export const HANDBOOK_TITLE = 'Handbook';
export const HANDBOOK_DESCRIPTION = "Your team's context and instructions, for the people and the agents who work here.";

// The folder holding an item's files, relative to src/.
export const rootOf = (contributor: string, id: string) =>
  contributor === HANDBOOK_KEY ? HANDBOOK_KEY : `prototypes/${contributor}/${id}`;

// The app path of a prototype's page, without the base: its items are under it.
export const prototypePath = (contributor: string, id: string) =>
  contributor === HANDBOOK_KEY ? `/${HANDBOOK_KEY}` : `/${contributor}/${id}`;
