const Application = require('../models/Application');
const Job = require('../models/Job');

// @POST /api/applications — Candidate applies
const applyToJob = async (req, res) => {
  try {
    const { job, coverLetter } = req.body;
    if (!job) return res.status(400).json({ message: 'Job ID is required' });

    const jobExists = await Job.findById(job);
    if (!jobExists) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = await Application.findOne({
      job,
      candidate: req.user._id,
    });
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this job' });

    const application = await Application.create({
      job,
      candidate: req.user._id,
      coverLetter: coverLetter || '',
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/my — Candidate's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location type salary')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/job/:jobId — Employer sees applicants
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/applications/:id/status — Employer updates status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('candidate', 'name email')
     .populate('job', 'title company');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/candidate/stats — Candidate stats
const getCandidateStats = async (req, res) => {
  try {
    const total = await Application.countDocuments({ candidate: req.user._id });
    const reviewed = await Application.countDocuments({ candidate: req.user._id, status: 'reviewed' });
    const shortlisted = await Application.countDocuments({ candidate: req.user._id, status: 'shortlisted' });
    const rejected = await Application.countDocuments({ candidate: req.user._id, status: 'rejected' });

    res.json({ total, reviewed, shortlisted, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getCandidateStats,
};