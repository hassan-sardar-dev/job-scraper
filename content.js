function injectReviewJobsButton() {
  const isOnJobsPage = window.location.pathname.startsWith('/jobs');
  if (!isOnJobsPage) return;

  const targetDiv = document.querySelector(
    '.scaffold-layout__row.scaffold-layout__content.scaffold-layout__content--sidebar-main.scaffold-layout__content--has-sidebar'
  );

  if (targetDiv && !document.getElementById('custom-review-jobs-container')) {
    const customDiv = document.createElement('div');
    customDiv.id = 'custom-review-jobs-container';
    customDiv.style.position = 'absolute';
    customDiv.style.top = '20px';
    customDiv.style.right = '30px';
    customDiv.style.zIndex = '9999';

    const reviewBtn = document.createElement('button');
    reviewBtn.textContent = 'Review Jobs';
    reviewBtn.style.padding = '10px 20px';
    reviewBtn.style.backgroundColor = '#0073b1';
    reviewBtn.style.color = '#fff';
    reviewBtn.style.border = 'none';
    reviewBtn.style.borderRadius = '4px';
    reviewBtn.style.cursor = 'pointer';
    reviewBtn.style.fontSize = '14px';
    reviewBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

    reviewBtn.onclick = () => {
      const jobCards = document.querySelectorAll('.jobs-search-results__list-item, .job-card-container--clickable');
      const jobData = [];

      jobCards.forEach(card => {
        const title = card.querySelector('.job-card-list__title')?.innerText?.trim() || 'N/A';
        const company = card.querySelector('.job-card-container__company-name')?.innerText?.trim() || 'N/A';
        const location = card.querySelector('.job-card-container__metadata-item')?.innerText?.trim() || 'N/A';
        const link = card.querySelector('a.job-card-list__title')?.href || 'N/A';

        jobData.push({ title, company, location, link });
      });

      console.table(jobData);
      alert(`✅ Scraped ${jobData.length} jobs! Check console.`);
    };

    customDiv.appendChild(reviewBtn);
    targetDiv.style.position = 'relative';
    targetDiv.appendChild(customDiv);
  }
}

window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    const jobCards = document.querySelectorAll('.jobs-search-results__list-item, .job-card-container--clickable');
    if (jobCards.length > 0) {
      clearInterval(checkInterval);
      injectReviewJobsButton();
    }
  }, 1000);
});
