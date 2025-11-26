const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '章节标题不能为空'],
    trim: true
  },
  content: {
    type: String,
    required: [true, '章节内容不能为空']
  },
  summary: {
    type: String,
    required: [true, '章节概述不能为空']
  },
  chapterIndex: {
    type: Number,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  generationPrompt: {
    type: String,
    default: ''
  },
  editedContent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

const volumeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '分卷标题不能为空'],
    trim: true
  },
  summary: {
    type: String,
    required: [true, '分卷概述不能为空']
  },
  volumeIndex: {
    type: Number,
    required: true
  },
  chapters: [chapterSchema]
}, {
  timestamps: true
});

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '小说标题不能为空'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coreTheme: {
    type: String,
    required: [true, '核心主题不能为空']
  },
  writingStyle: {
    type: String,
    required: [true, '写作风格不能为空']
  },
  expectedLength: {
    type: String,
    required: [true, '预期长度不能为空']
  },
  genre: {
    type: String,
    required: [true, '小说类型不能为空']
  },
  characters: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['主角', '配角', '反派'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    personality: String,
    background: String,
    goals: String
  }],
  synopsis: {
    type: String,
    required: [true, '故事概述不能为空']
  },
  worldSetting: {
    type: String,
    required: [true, '世界观设定不能为空']
  },
  volumes: [volumeSchema],
  outline: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['outline', 'writing', 'completed', 'published', 'archived'],
    default: 'outline'
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [String],
  settings: {
    targetWordCount: Number,
    chaptersPerVolume: {
      type: Number,
      default: 5
    },
    aiModel: {
      type: String,
      enum: ['openai', 'anthropic', 'custom'],
      default: 'openai'
    },
    customModelUrl: String
  },
  stats: {
    totalVolumes: {
      type: Number,
      default: 0
    },
    totalChapters: {
      type: Number,
      default: 0
    },
    totalWords: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 更新统计信息的中间件
novelSchema.pre('save', function(next) {
  this.stats.totalVolumes = this.volumes.length;
  this.stats.totalChapters = this.volumes.reduce((total, volume) => 
    total + volume.chapters.length, 0);
  this.stats.totalWords = this.volumes.reduce((total, volume) => 
    total + volume.chapters.reduce((chapTotal, chapter) => 
      chapTotal + (chapter.wordCount || 0), 0), 0);
  this.stats.lastUpdated = new Date();
  next();
});

// 获取下一章节索引的方法
novelSchema.methods.getNextChapterIndex = function(volumeIndex) {
  if (!this.volumes[volumeIndex]) {
    return 1;
  }
  return this.volumes[volumeIndex].chapters.length + 1;
};

// 获取下一分卷索引的方法
novelSchema.methods.getNextVolumeIndex = function() {
  return this.volumes.length + 1;
};

module.exports = mongoose.model('Novel', novelSchema);
