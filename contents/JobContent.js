let currentJobId = "";
function scrapeJobDetails() {
    const jobTitle = document.querySelector(".job-details-jobs-unified-top-card__job-title, .topcard__title, .t-24")?.innerText.trim() || "N/A";
    const companyName = document.getElementsByClassName("job-details-jobs-unified-top-card__company-name")
    const companyLink = document.querySelector(".jobs-unified-top-card__company-name a, .topcard__org-name-link")?.href || "N/A";
    const jobDescriptionElem = document.querySelector(".jobs-description__content, .description__text, .jobs-description-content__text");
    const jobDescription = jobDescriptionElem?.innerText.trim() || "N/A";
    const companyLogoElem = document.querySelector(".jobs-unified-top-card__company-image img, .artdeco-entity-image img, .company-logo img, .ivm-image-view-model img");
    const companyLogo = companyLogoElem?.src || "N/A";
    const jobUrl = window.location.href;
    const jobDetails = {
        "Job Title": jobTitle,
        "Company": companyName,
        "Company Profile Link": companyLink,
        "Description": jobDescription,
        "Company Logo URL": companyLogo,
        "Job URL": jobUrl,
    };
    console.log("Scraped Job Details:", jobDetails);
    return jobDetails;
}
function injectButtonToJobDetail() {
    if (document.getElementById("linkedin-job-button")) return;

    const jobDetailPanel = document.querySelector(".jobs-search__job-details--container");
    if (!jobDetailPanel) return;

    const button = document.createElement("button");
    button.id = "linkedin-job-button";
    button.innerText = "Scrape Job Details";
    button.style.padding = "10px 16px";
    button.style.margin = "10px";
    button.style.background = "#0a66c2";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";

    button.onclick = () => {
        scrapeJobDetails();
    };

    jobDetailPanel.prepend(button);
}

function observeJobDetailChanges() {
    const jobDetailContainer = document.querySelector(".jobs-search__job-details--wrapper") || document.body;
    const observer = new MutationObserver(() => {
        const jobIdMatch = location.href.match(/\/jobs\/view\/(\d+)/);
        const jobId = jobIdMatch ? jobIdMatch[1] : null;

        if (jobId && jobId !== currentJobId) {
            currentJobId = jobId;
            setTimeout(injectButtonToJobDetail, 500);
        }
    });

    observer.observe(jobDetailContainer, { childList: true, subtree: true });
}

window.addEventListener("load", () => {
    observeJobDetailChanges();
    setTimeout(injectButtonToJobDetail, 1000);
});