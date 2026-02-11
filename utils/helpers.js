const slugify = (text) => {
  return text
    ? text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
    : "";
};

const generateJdUrl = (job) => {
  const title = slugify(job.title);
  const company = slugify(job.companyName);
  const locationObj = job.placeholders?.find((p) => p.type === "location");
  const loc = slugify(locationObj ? locationObj.label : "india");
  const exp = slugify(job.experienceText || "0-0-years");
  const id = job.jobId;
  return `https://www.naukri.com/job-listings-${title}-${company}-${loc}-${exp}-${id}?src=seo_srp`;
};

module.exports = {
  slugify,
  generateJdUrl,
};
