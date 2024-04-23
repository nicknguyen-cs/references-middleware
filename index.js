const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

const apiKey = process.env.API_KEY;
const authToken = process.env.MANAGEMENT_TOKEN;

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('api_key', apiKey);
headers.append('authorization', authToken);

app.get('/references', async (req, res) => {
    let parentReferences = await getParentReferences(req.query.entry_uid, req.query.content_type_uid);
    res.send(parentReferences);
});

app.get('/asset-references', async (req, res) => {
    let assetUid = req.query.asset_uid;
    let listofrefs = [];
    try {
        fetch(`https://api.contentstack.io/v3/assets/${assetUid}/references`, {
            method: 'GET',
            headers: headers
        })
        .then(response => response.json())
        .then(async data => {
            listofrefs = data.references; // Initial Refs
            for (let reference of data.references) { // Loop through each reference
                let refs = await getParentReferences(reference.entry_uid, reference.content_type_uid)
                listofrefs = [...listofrefs, ...refs]; // Concatenate the new refs
            }
            filterDuplicatesByDepth(listofrefs); // Filter duplicats of all references
            listofrefs.sort((a, b) => a.height - b.height);  // Re-sort new list
            return listofrefs;
        })
        .then(data => { res.send(data) });
     } catch (e) {
        res.send(500);
    }
})

app.listen(port, () => {
    console.log(`Middleware running @ http://localhost:${port}`);
});


/**
 * Retrieves the parent references of a given entry in Contentstack.
 *
 * @param {string} entryUid - The UID of the entry.
 * @param {string} contentTypeUid - The UID of the content type.
 * @param {number} [height=0] - The depth of the current reference.
 * @param {boolean} [isRootCall=true] - Indicates if this is the root call.
 * @param {Set} [visited=new Set()] - Set of visited entry UIDs to avoid infinite recursion.
 * @returns {Promise<Array>} - A promise that resolves to an array of parent references.
 */
async function getParentReferences(entryUid, contentTypeUid, height = 0, isRootCall = true, visited = new Set()) {
    if (visited.has(entryUid)) {
        // Already visited this entry; return to avoid infinite recursion
        return [];
    }
    visited.add(entryUid);

    let data;
    try {
        console.log(`https://api.contentstack.io/v3/content_types/${contentTypeUid}/entries/${entryUid}/references`);
        const response = await fetch(`https://api.contentstack.io/v3/content_types/${contentTypeUid}/entries/${entryUid}/references`, {
            method: 'GET',
            headers: headers
        });
        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }

    const references = data.references || [];

    if (!Array.isArray(references) || references.length === 0) return [];
    // Add depth to each reference
    references.forEach((ref) => ref.height = height);

    let allRefs = [...references];
    for (let reference of references) {
        const parentRefs = await getParentReferences(reference.entry_uid, reference.content_type_uid, height + 1, false, visited);
        allRefs = [...allRefs, ...parentRefs];
    }

    // If this is the root call (i.e., the initial call), filter duplicates. Otherwise, just return all references.
    if (isRootCall) {
        allRefs = filterDuplicatesByDepth(allRefs);
    }
    return allRefs;
}


/**
 * Filters an array of references to remove duplicates based on entry_uid and returns the unique references with the lowest height.
 *
 * @param {Array} references - The array of references to filter.
 * @returns {Array} - The array of unique references with the lowest height.
 */
async function filterDuplicatesByDepth(references) {
    return Array.from(new Set(references.map((ref) => ref.entry_uid)))
        .map(entry_uid => {
            const duplicates = references.filter(ref => ref.entry_uid === entry_uid);
            return duplicates.sort((a, b) => a.height - b.height)[0];
        });
}
