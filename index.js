const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

// Define your API key and token
const apiKey = process.env.API_KEY;
const authToken = process.env.MANAGEMENT_TOKEN;

// Set up the headers
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('api_key', apiKey); // Assuming the API expects the key as 'api_key'
headers.append('Authorization', authToken);

// Define the endpoint with a route handler
app.get('/references', async (req, res) => {
    let parentReferences = await getParentReferences(req.query.entry_uid, req.query.content_type_uid);
    res.json( parentReferences);
});

// Start the server
app.listen(port, () => {
    console.log(`Middleware running @ http://localhost:${port}`);
});


async function getParentReferences(entryUid, contentTypeUid, height = 0, isRootCall = true, visited = new Set()) {
    if (visited.has(entryUid)) {
        // Already visited this entry; return to avoid infinite recursion
        return [];
    }
    visited.add(entryUid);
    
    let data;
    try {
        const response = await fetch(`https://api.contentstack.io/v3/content_types/${contentTypeUid}/entries/${entryUid}/references`, {
            method: 'GET',
            headers: headers // Ensure 'headers' is defined elsewhere in your code
        });
        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
        return []; // Return an empty array or appropriate error handling
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
        allRefs = await filterDuplicatesByDepth(allRefs);
    }
    return allRefs;
}


async function filterDuplicatesByDepth(references) {
    const uniqueRefs = Array.from(new Set(references.map((ref) => ref.entry_uid)))
        .map(entry_uid => {
            const duplicates = references.filter(ref => ref.entry_uid === entry_uid);
            return duplicates.sort((a, b) => a.height - b.height)[0];
        });

    return uniqueRefs;
}
