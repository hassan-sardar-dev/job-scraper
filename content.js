// LinkedIn Job Scraper Content Script
console.log("LinkedIn Job Scraper loaded");

// Only run the script on LinkedIn jobs pages
if (window.location.href.includes('linkedin.com/jobs')) {
  function createScrapeButton() {
    if (document.getElementById('linkedin-job-scraper-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'linkedin-job-scraper-btn';
    button.innerText = 'Scrape Jobs';
    button.style.position = 'absolute';
    button.style.top = '70px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#0a66c2';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';

    button.onmouseover = function () {
      this.style.backgroundColor = '#004182';
    };
    button.onmouseout = function () {
      this.style.backgroundColor = '#0a66c2';
    };

    button.addEventListener('click', startJobScraping);

    document.body.appendChild(button);
  }

  // Scroll down to load more jobs
  async function scrollToLoadJobs() {
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    let lastScrollHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 25;

    let currentPosition = 0;
    const scrollStep = 300;

    while (lastScrollHeight !== document.body.scrollHeight && scrollAttempts < maxScrollAttempts) {
      lastScrollHeight = document.body.scrollHeight;

      for (let i = 0; i < 10; i++) {
        currentPosition += scrollStep;
        window.scrollTo(0, currentPosition);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      scrollAttempts++;
    }

    const scrollToTop = () => {
      if (window.pageYOffset > 0) {
        window.scrollTo(0, window.pageYOffset - 300);
        setTimeout(scrollToTop, 50);
      }
    };

    scrollToTop();
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Finished scrolling, loaded jobs");
    return true;
  }

  function showStatus(message) {
    let statusDiv = document.getElementById('linkedin-job-scraper-status');

    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'linkedin-job-scraper-status';
      statusDiv.style.position = 'fixed';
      statusDiv.style.top = '110px';
      statusDiv.style.right = '20px';
      statusDiv.style.zIndex = '9999';
      statusDiv.style.padding = '8px 12px';
      statusDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      statusDiv.style.color = 'white';
      statusDiv.style.borderRadius = '4px';
      statusDiv.style.fontWeight = 'bold';
      document.body.appendChild(statusDiv);
    }

    statusDiv.innerText = message;
  }

  // Hide status message
  function hideStatus() {
    const statusDiv = document.getElementById('linkedin-job-scraper-status');
    if (statusDiv) {
      statusDiv.remove();
    }
  }

  async function startJobScraping() {
    console.log("Job scraping started...");


    await scrollToLoadJobs();


    showStatus("Scraping jobs...");
    const jobData = scrapeJobs();


    console.log("LinkedIn Jobs Data:");
    console.log(jobData);

    

    setTimeout(hideStatus, 3000);

    return jobData;
  }


  function scrapeJobs() {

    const scrapedData = {};

    ''
    const sections = document.querySelectorAll('.jobs-recommendation-card, .jobs-job-board-list');


    if (sections.length === 0) {
      scrapedData["All Jobs"] = scrapeJobsFromGenericSection(document.body);
      return scrapedData;
    }


    sections.forEach(section => {

      let sectionTitle = "Unknown Section";


      const heading = section.querySelector('h2, h3') ||
        section.previousElementSibling?.querySelector('h2, h3') ||
        section.previousElementSibling;

      if (heading && heading.textContent) {
        sectionTitle = heading.textContent.trim();
      }


      const jobsInSection = scrapeJobsFromSection(section);


      if (jobsInSection.length > 0) {
        scrapedData[sectionTitle] = jobsInSection;
      }
    });

    return scrapedData;
  }


  function scrapeJobsFromSection(section) {
    const jobs = [];


    const jobCards = section.querySelectorAll('.job-card-container, .jobs-job-board-list__item');

    jobCards.forEach(card => {
      const jobData = extractJobData(card);
      if (jobData) {
        jobs.push(jobData);
      }
    });

    return jobs;
  }


  function scrapeJobsFromGenericSection(container) {
    const jobs = [];


    const jobCards = container.querySelectorAll('.job-card-container, .jobs-job-board-list__item, .jobs-search-results__list-item');

    jobCards.forEach(card => {
      const jobData = extractJobData(card);
      if (jobData) {
        jobs.push(jobData);
      }
    });

    return jobs;
  }


  function extractJobData(jobCard) {

    if (!jobCard) return null;


    const job = {};


    const titleElement = jobCard.querySelector('.job-card-list__title, .job-card-container__link, [data-job-title]');
    if (titleElement) {
      job.title = titleElement.textContent.trim();
    }


    const companyElement = jobCard.querySelector('.job-card-container__company-name, .job-card-container__primary-description, [data-company-name]');
    if (companyElement) {
      job.company = companyElement.textContent.trim();
    }


    const logoElement = jobCard.querySelector('.artdeco-entity-image, .job-card-container__company-logo, .company-logo');
    if (logoElement && logoElement.src) {
      job.companyLogo = logoElement.src;
    } else {

      const nestedLogo = jobCard.querySelector('picture img, .company-logo-container img');
      if (nestedLogo && nestedLogo.src) {
        job.companyLogo = nestedLogo.src;
      }
    }


    const locationElement = jobCard.querySelector('.job-card-container__metadata-item, .job-card-container__secondary-description, [data-job-location]');
    if (locationElement) {
      job.location = locationElement.textContent.trim();
    }


    const linkElement = jobCard.querySelector('a.job-card-container__link, a.job-card-list__title');
    if (linkElement && linkElement.href) {
      job.url = linkElement.href;
    }


    const timeElement = jobCard.querySelector('.job-card-container__footer-item, .job-card-container__listed-time, time');
    if (timeElement) {
      job.postedTime = timeElement.textContent.trim();
    }


    if (!job.title && !job.company) return null;

    return job;
  }


  window.addEventListener('load', () => {

    setTimeout(createScrapeButton, 1500);
  });


  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      if (window.location.href.includes('linkedin.com/jobs')) {
        setTimeout(createScrapeButton, 1500);
      }
    }
  }).observe(document, { subtree: true, childList: true });


  setTimeout(createScrapeButton, 1500);
}