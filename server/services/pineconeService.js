const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('./aiService');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);

// ─── Upsert a job into Pinecone when it's created ──────────────────────────
const upsertJobEmbedding = async (job) => {
  try {
    const text = `${job.title} ${job.description || ''} ${(job.skills || []).join(' ')} ${job.location || ''} ${job.type || ''}`;
    const embedding = await generateEmbedding(text);
    if (!embedding) return;

    await index.upsert({
      records: [{
        id: job._id.toString(),
        values: embedding,
        metadata: {
          title:       job.title       || '',
          company:     job.company     || '',
          location:    job.location    || '',
          type:        job.type        || '',
          salary:      job.salary      || '',
          skills:      (job.skills || []).join(', '),
          isActive:    job.isActive !== false,
        },
      }],
    });

    console.log(`✅ Pinecone upsert: ${job.title}`);
  } catch (err) {
    console.error('❌ upsertJobEmbedding error:', err.message);
  }
};

// ─── Delete a job from Pinecone when it's removed ──────────────────────────
const deleteJobEmbedding = async (jobId) => {
  try {
    await index.deleteOne({ id: jobId.toString() });
    console.log(`🗑️  Pinecone delete: ${jobId}`);
  } catch (err) {
    console.error('❌ deleteJobEmbedding error:', err.message);
  }
};

// ─── Semantic search — returns array of { jobId, score } ───────────────────
const semanticSearchJobs = async (queryText, topK = 10) => {
  try {
    const embedding = await generateEmbedding(queryText);
    if (!embedding) return [];

    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: { isActive: { $eq: true } },
    });

    return results.matches.map(m => ({
      jobId: m.id,
      score: m.score,
      metadata: m.metadata,
    }));
  } catch (err) {
    console.error('❌ semanticSearchJobs error:', err.message);
    return [];
  }
};

// ─── Sync ALL existing jobs into Pinecone (run once) ───────────────────────
const syncAllJobs = async (jobs) => {
  console.log(`🔄 Syncing ${jobs.length} jobs to Pinecone...`);
  for (const job of jobs) {
    await upsertJobEmbedding(job);
  }
  console.log('✅ Pinecone sync complete');
};

module.exports = { upsertJobEmbedding, deleteJobEmbedding, semanticSearchJobs, syncAllJobs };