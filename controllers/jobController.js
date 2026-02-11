const axios = require("axios");
const config = require("../config/config");
const { generateJdUrl } = require("../utils/helpers");

const getJobs = async (req, res, next) => {
  try {
    const { location = "chennai", page = 1 } = req.query;
    const keyword = "freshers";

    const seoKeySuffix = parseInt(page) > 1 ? `-${page}` : "";
    const seoKey = `${keyword}-jobs-in-${location}${seoKeySuffix}`;

    const apiUrl = `${config.API_BASE_URL}/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=${location}&keyword=${keyword}&pageNo=${page}&seoKey=${seoKey}&src=seo_srp`;

    const response = await axios.get(apiUrl, {
      headers: {
        ...config.HEADERS,
        referer: `${config.API_BASE_URL}/${seoKey}`,
      },
    });

    const jobList = response.data.jobDetails || [];

    const formattedJobs = jobList.map((job) => {
      const locationData = job.placeholders?.find((p) => p.type === "location");

      return {
        groupId: job.groupId || null,
        logoPath: job.logoPath || "No Logo",
        companyName: job.companyName,
        currency: job.currency || "INR",
        jdURL: generateJdUrl(job),
        maximumExperience: job.maximumExperience,
        minimumExperience: job.minimumExperience,
        location: locationData ? locationData.label : job.placePlaceholder,
        salaryDetail: job.salaryDetail,
        vacancy: job.brandingTags || [],
      };
    });

    res.json({
      success: true,
      totalJobsInLocation: response.data.noOfJobs,
      jobsOnThisPage: jobList.length,
      currentPage: parseInt(page),
      results: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyJobs = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const currentPage = Math.max(1, parseInt(page));
    const resultsPerPage = Math.min(Math.max(1, parseInt(limit)), 50);

    const apiUrl = `${config.API_BASE_URL}/jobapi/v3/search?noOfResults=${resultsPerPage}&urlType=search_by_company&searchType=adv&groupId=${groupId}&pageNo=${currentPage}&src=jobsearchDesk`;

    const response = await axios.get(apiUrl, {
      headers: {
        ...config.HEADERS,
        referer: `${config.API_BASE_URL}/`,
      },
    });

    const jobList = response.data.jobDetails || [];
    const totalJobs = response.data.noOfJobs || 0;

    if (jobList.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No jobs found for the given groupId.",
      });
    }

    const company = jobList[0];
    const totalPages = Math.ceil(totalJobs / resultsPerPage);

    const formattedJobs = jobList.map((job) => {
      const locationData = job.placeholders?.find((p) => p.type === "location");

      return {
        jobId: job.jobId || null,
        title: job.title || "N/A",
        jdURL: generateJdUrl(job),
        maximumExperience: job.maximumExperience,
        minimumExperience: job.minimumExperience,
        location: locationData ? locationData.label : job.placePlaceholder,
        salaryDetail: job.salaryDetail,
        currency: job.currency || "INR",
        vacancy: job.brandingTags || [],
        postedDate: job.createdDate || null,
        tags: job.tagsAndSkills || null,
      };
    });

    res.json({
      success: true,
      groupId: parseInt(groupId),
      companyName: company.companyName,
      logoPath: company.logoPath || company.logoPathV3 || "No Logo",
      staticUrl: company.staticUrl
        ? `${config.API_BASE_URL}/${company.staticUrl}`
        : null,
      totalJobs,
      jobsOnThisPage: jobList.length,
      currentPage,
      totalPages,
      resultsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getCompanyJobs,
};
