// src/services/analysisService.js

import api from "./api";

export const analysisService = {
  /**
   * Analyze uploaded file
   * @param {File} file - The file to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeFile(file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Add analysis options
    if (options.language) formData.append("language", options.language);
    if (options.analysisType)
      formData.append("analysisType", JSON.stringify(options.analysisType));

    // Determine file type
    const isAudio = file.type.startsWith("audio/");
    const fileType = isAudio ? "audio" : "text";
    formData.append("type", fileType);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes for analysis
    };

    // Add upload progress callback
    if (options.onUploadProgress) {
      config.onUploadProgress = options.onUploadProgress;
    }

    try {
      const response = await api.post("/analysis", formData, config);
      return response.data;
    } catch (error) {
      // Transform error for better handling
      if (error.response?.status === 413) {
        throw new Error("FILE_TOO_LARGE");
      } else if (error.response?.status === 415) {
        throw new Error("UNSUPPORTED_FORMAT");
      } else if (error.response?.status === 422) {
        throw new Error("INVALID_FILE_CONTENT");
      }
      throw error;
    }
  },

  /**
   * Get analysis by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<Object>} Analysis data
   */
  async getAnalysis(analysisId) {
    const response = await api.get(`/analysis/${analysisId}`);
    return response.data;
  },

  /**
   * Get user's analysis history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Analysis history
   */
  async getHistory(params = {}) {
    const queryString = new URLSearchParams({
      limit: params.limit || 20,
      offset: params.offset || 0,
      sortBy: params.sortBy || "timestamp",
      sortOrder: params.sortOrder || "desc",
      ...params,
    }).toString();

    const response = await api.get(`/analysis/history?${queryString}`);
    return response.data;
  },

  /**
   * Delete analysis
   * @param {string} analysisId - Analysis ID to delete
   * @returns {Promise<void>}
   */
  async deleteAnalysis(analysisId) {
    await api.delete(`/analysis/${analysisId}`);
  },

  /**
   * Re-analyze existing file
   * @param {string} analysisId - Original analysis ID
   * @param {Object} options - New analysis options
   * @returns {Promise<Object>} New analysis results
   */
  async reAnalyze(analysisId, options = {}) {
    const response = await api.post(
      `/analysis/${analysisId}/reanalyze`,
      options
    );
    return response.data;
  },

  /**
   * Get analysis statistics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Statistics data
   */
  async getStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/analysis/stats?${queryString}`);
    return response.data;
  },
};

// Mock implementation for development
export const mockAnalysisService = {
  async analyzeFile(file, options = {}) {
    // Simulate upload progress
    if (options.onUploadProgress) {
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        setTimeout(() => {
          options.onUploadProgress({
            loaded: (i * file.size) / totalSteps,
            total: file.size,
          });
        }, i * 100);
      }
    }

    // Simulate processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    // Generate unique results based on file characteristics
    const isAudio = file.type.startsWith("audio/");
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;
    
    // Create a deterministic seed based on file characteristics
    const seed = this.createFileSeed(fileName, fileSize, file.type);
    const random = this.seededRandom(seed);
    
    // Generate varied results based on file characteristics
    const baseScore = this.generateScoreFromFile(fileName, fileSize, isAudio, random);
    const sentiment = this.generateSentimentFromFile(fileName, random);

    const mockResult = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      results: {
        overallScore: Math.round(baseScore),
        sentiment: {
          label: sentiment,
          confidence: 0.75 + random() * 0.24,
          score:
            sentiment === "positive"
              ? 80 + random() * 20
              : sentiment === "neutral"
                ? 40 + random() * 40
                : 20 + random() * 40,
        },
        clarity: {
          score: Math.round(baseScore + (random() - 0.5) * 20),
          issues: this.generateClarityIssues(fileName, random),
          metrics: {
            articulation: Math.round(70 + random() * 30),
            pace: Math.round(65 + random() * 35),
            volume: Math.round(75 + random() * 25),
            pronunciation: Math.round(80 + random() * 20)
          }
        },
        engagement: {
          score: Math.round(baseScore + (random() - 0.5) * 30),
          highlights: this.generateEngagementHighlights(fileName, random),
          metrics: {
            energy: Math.round(70 + random() * 30),
            enthusiasm: Math.round(65 + random() * 35),
            confidence: Math.round(75 + random() * 25),
            charisma: Math.round(60 + random() * 40)
          }
        },
        technical: {
          score: Math.round(baseScore + (random() - 0.5) * 20),
          metrics: {
            audioQuality: Math.round(80 + random() * 20),
            backgroundNoise: Math.round(20 + random() * 30),
            echo: Math.round(10 + random() * 20),
            distortion: Math.round(5 + random() * 15)
          }
        },
        speechPatterns: {
          wordsPerMinute: Math.round(120 + random() * 60),
          pauseFrequency: Math.round(5 + random() * 10),
          fillerWords: Math.round(2 + random() * 8),
          sentenceLength: Math.round(12 + random() * 8)
        },
        recommendations: this.generateFileBasedRecommendations(baseScore, isAudio, fileName, random),
        insights: this.generateFileBasedInsights(baseScore, sentiment, fileName, random),
        trends: this.generateFileBasedTrends(fileName, random)
      },
      metadata: {
        duration: isAudio ? Math.round(30 + random() * 300) : null, // 30s to 5min
        fileSize: file.size,
        format: file.type,
        processingTime: Math.round(1000 + random() * 4000), // 1-5 seconds
        fileName: file.name
      },
    };

    return mockResult;
  },

  async getAnalysis(analysisId) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: analysisId /* mock data */ };
  },

  async getHistory(params = {}) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      analyses: [],
      total: 0,
      hasMore: false,
    };
  },

  async deleteAnalysis(analysisId) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async reAnalyze(analysisId, options = {}) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      id: `reanalysis_${Date.now()}`,
      timestamp: new Date().toISOString(),
      results: {
        overallScore: Math.round(60 + Math.random() * 35),
        /* other mock data */
      },
    };
  },

  async getStats(params = {}) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      totalAnalyses: Math.floor(Math.random() * 100),
      averageScore: Math.round(70 + Math.random() * 20),
      topCategories: ["clarity", "engagement", "sentiment"],
    };
  },

  // Helper methods for generating file-based analysis
  createFileSeed(fileName, fileSize, fileType) {
    // Create a deterministic seed based on file characteristics
    const seedString = `${fileName}_${fileSize}_${fileType}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  },

  seededRandom(seed) {
    // Simple seeded random number generator
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  },

  generateScoreFromFile(fileName, fileSize, isAudio, random) {
    let baseScore = 60;
    
    // File size influence (larger files might indicate more content)
    if (fileSize > 1000000) baseScore += 10; // > 1MB
    else if (fileSize > 100000) baseScore += 5; // > 100KB
    
    // File name influence
    if (fileName.includes('presentation') || fileName.includes('speech')) {
      baseScore += 15; // Professional content
    } else if (fileName.includes('meeting') || fileName.includes('interview')) {
      baseScore += 10; // Business content
    } else if (fileName.includes('test') || fileName.includes('practice')) {
      baseScore -= 5; // Practice content might be less polished
    }
    
    // File type influence
    if (isAudio) {
      if (fileName.includes('wav') || fileName.includes('flac')) {
        baseScore += 5; // High quality audio formats
      } else if (fileName.includes('mp3')) {
        baseScore += 2; // Standard quality
      }
    }
    
    // Add some randomness but keep it within bounds
    const variation = (random() - 0.5) * 20;
    return Math.max(40, Math.min(95, baseScore + variation));
  },

  generateSentimentFromFile(fileName, random) {
    const sentiments = ["positive", "neutral", "negative"];
    
    // File name influence on sentiment
    if (fileName.includes('happy') || fileName.includes('positive') || fileName.includes('success')) {
      return "positive";
    } else if (fileName.includes('sad') || fileName.includes('negative') || fileName.includes('problem')) {
      return "negative";
    } else if (fileName.includes('meeting') || fileName.includes('business') || fileName.includes('formal')) {
      return "neutral";
    }
    
    // Random selection with slight bias toward positive
    const rand = random();
    if (rand < 0.4) return "positive";
    else if (rand < 0.7) return "neutral";
    else return "negative";
  },

  generateClarityIssues(fileName, random) {
    const allIssues = ["filler_words", "pace_variations", "pronunciation_issues", "volume_inconsistency", "background_noise"];
    const issues = [];
    
    // File name influence
    if (fileName.includes('fast') || fileName.includes('quick')) {
      issues.push("pace_variations");
    }
    if (fileName.includes('noisy') || fileName.includes('background')) {
      issues.push("background_noise");
    }
    if (fileName.includes('practice') || fileName.includes('test')) {
      issues.push("filler_words");
    }
    
    // Add random issues
    const numIssues = Math.floor(random() * 3);
    for (let i = 0; i < numIssues; i++) {
      const issue = allIssues[Math.floor(random() * allIssues.length)];
      if (!issues.includes(issue)) {
        issues.push(issue);
      }
    }
    
    return issues;
  },

  generateEngagementHighlights(fileName, random) {
    const allHighlights = ["clear_articulation", "confident_tone", "good_pacing", "energetic_delivery", "varied_intonation", "strong_eye_contact"];
    const highlights = [];
    
    // File name influence
    if (fileName.includes('presentation') || fileName.includes('speech')) {
      highlights.push("confident_tone", "clear_articulation");
    }
    if (fileName.includes('energetic') || fileName.includes('motivational')) {
      highlights.push("energetic_delivery", "varied_intonation");
    }
    
    // Add random highlights
    const numHighlights = Math.floor(random() * 3) + 1;
    for (let i = 0; i < numHighlights; i++) {
      const highlight = allHighlights[Math.floor(random() * allHighlights.length)];
      if (!highlights.includes(highlight)) {
        highlights.push(highlight);
      }
    }
    
    return highlights;
  },

  generateFileBasedRecommendations(baseScore, isAudio, fileName, random) {
    const recommendations = [];
    
    // Base recommendations
    if (baseScore < 70) {
      if (isAudio) {
        recommendations.push("Speak more clearly and at a consistent pace");
        recommendations.push("Reduce background noise for better audio quality");
        recommendations.push("Practice articulation exercises to improve clarity");
      } else {
        recommendations.push("Use more varied vocabulary to enhance engagement");
        recommendations.push("Consider shorter sentences for better readability");
        recommendations.push("Add more descriptive language to improve impact");
      }
    } else if (baseScore < 85) {
      if (isAudio) {
        recommendations.push("Great clarity! Try varying your tone for more engagement");
        recommendations.push("Consider pausing between key points for emphasis");
      } else {
        recommendations.push("Good structure! Consider adding more examples");
        recommendations.push("Try using more active voice for stronger impact");
      }
    } else {
      recommendations.push("Excellent work! Your communication is clear and engaging");
      recommendations.push("Maintain this level of quality in future recordings");
    }
    
    // File-specific recommendations
    if (fileName.includes('presentation')) {
      recommendations.push("Consider adding more visual aids to support your points");
    } else if (fileName.includes('interview')) {
      recommendations.push("Practice answering common interview questions with confidence");
    } else if (fileName.includes('meeting')) {
      recommendations.push("Structure your points more clearly for better meeting flow");
    }
    
    return recommendations;
  },

  generateFileBasedInsights(baseScore, sentiment, fileName, random) {
    const insights = [];
    
    // Base insights
    if (baseScore > 85) {
      insights.push({
        type: "strength",
        title: "Outstanding Performance",
        description: "Your communication skills are exceptional with excellent clarity and engagement.",
        impact: "high"
      });
    }
    
    if (sentiment === "positive") {
      insights.push({
        type: "strength", 
        title: "Positive Tone",
        description: "Your positive sentiment creates an engaging and motivating atmosphere.",
        impact: "medium"
      });
    }
    
    if (baseScore < 70) {
      insights.push({
        type: "improvement",
        title: "Areas for Growth",
        description: "Focus on clarity and pacing to improve overall communication effectiveness.",
        impact: "high"
      });
    }
    
    // File-specific insights
    if (fileName.includes('presentation')) {
      insights.push({
        type: "tip",
        title: "Presentation Tip",
        description: "Your presentation style shows good structure. Consider adding more storytelling elements.",
        impact: "medium"
      });
    } else if (fileName.includes('interview')) {
      insights.push({
        type: "tip",
        title: "Interview Tip",
        description: "Your interview responses demonstrate good preparation. Practice the STAR method for behavioral questions.",
        impact: "high"
      });
    } else {
      insights.push({
        type: "tip",
        title: "Pro Tip",
        description: "Practice speaking at 150-160 words per minute for optimal listener engagement.",
        impact: "low"
      });
    }
    
    return insights;
  },

  generateFileBasedTrends(fileName, random) {
    // Generate trends based on file characteristics
    const baseScore = 70 + random() * 20;
    const weekly = [];
    const monthly = [];
    
    // Generate weekly trends
    for (let i = 0; i < 7; i++) {
      const variation = (random() - 0.5) * 20;
      weekly.push({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        score: Math.round(baseScore + variation),
        clarity: Math.round(baseScore + variation + (random() - 0.5) * 10),
        engagement: Math.round(baseScore + variation + (random() - 0.5) * 10)
      });
    }
    
    // Generate monthly trends
    const months = ["Jan", "Feb", "Mar", "Apr"];
    for (let i = 0; i < 4; i++) {
      const variation = (random() - 0.5) * 15;
      monthly.push({
        month: months[i],
        score: Math.round(baseScore + variation),
        clarity: Math.round(baseScore + variation + (random() - 0.5) * 8),
        engagement: Math.round(baseScore + variation + (random() - 0.5) * 8)
      });
    }
    
    return { weekly, monthly };
  }
};


// Use mock service in development, real service in production
export default import.meta.env.MODE === "development"
  ? mockAnalysisService
  : analysisService;
