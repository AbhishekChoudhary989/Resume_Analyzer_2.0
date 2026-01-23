const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function fetchIndeedJobs(jobTitle, location) {
    try {
        console.log(`⚡ Fetching Live Jobs for: ${jobTitle} in ${location}...`);

        const input = {
            position: jobTitle,
            location: location,
            country: "IN",
            maxItems: 5, // 👈 CHANGED FROM 15 TO 5 (Much Faster)
            parseCompanyDetails: false, // 👈 Disabled deep parsing for speed
            saveOnlyUniqueItems: true,
            followApplyRedirects: false
        };

        const run = await client.actor("hMvNSpz3JnHgl5jkh").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) return [];

        return items.map(job => ({
            title: job.positionName || job.title || "Unknown Role",
            company: job.company || "Unknown Company",
            salary: job.salary || "Not disclosed",
            location: job.location || location,
            url: job.url || job.companyUrl || "https://indeed.com"
        }));

    } catch (error) {
        console.error("Apify Scraper Error:", error.message);
        return [];
    }
}

module.exports = { fetchIndeedJobs };