export const contentTypeDefinitions = {
  vocabulary: {
    name: "Vocabulary",
    icon: "BookOpen",
    color: "bg-blue-500/20 text-blue-600",
    fields: [
      { name: "word", label: "Word *", type: "text", placeholder: "Enter the word" },
      { name: "pronunciation", label: "Pronunciation *", type: "text", placeholder: "e.g., /wɜːrd/" },
      { name: "definition", label: "Definition *", type: "textarea", placeholder: "Explain the meaning" },
      {
        name: "partOfSpeech",
        label: "Part of Speech *",
        type: "select",
        options: ["Noun", "Verb", "Adjective", "Adverb", "Preposition"],
      },
      {
        name: "exampleSentence",
        label: "Example Sentence *",
        type: "textarea",
        placeholder: "Use the word in a sentence",
      },
      { name: "synonyms", label: "Synonyms (comma separated)", type: "text", placeholder: "e.g., word, term, phrase" },
      { name: "audioFile", label: "Audio File (Optional)", type: "file", accept: ".mp3,.wav" },
    ],
  },
  grammar: {
    name: "Grammar",
    icon: "BookMarked",
    color: "bg-purple-500/20 text-purple-600",
    fields: [
      { name: "topic", label: "Grammar Topic *", type: "text", placeholder: "e.g., Past Tense, Articles" },
      { name: "rule", label: "Grammar Rule *", type: "textarea", placeholder: "Explain the grammar rule" },
      {
        name: "examples",
        label: "Examples (one per line) *",
        type: "textarea",
        placeholder: "Line 1: Correct example\nLine 2: Incorrect example",
      },
      { name: "commonMistakes", label: "Common Mistakes", type: "textarea", placeholder: "Describe common errors" },
      { name: "exercises", label: "Practice Exercises *", type: "textarea", placeholder: "Provide practice sentences" },
      {
        name: "resources",
        label: "Additional Resources (URL)",
        type: "text",
        placeholder: "Link to grammar reference",
      },
    ],
  },
  pronunciation: {
    name: "Pronunciation",
    icon: "Mic",
    color: "bg-orange-500/20 text-orange-600",
    fields: [
      { name: "soundTitle", label: "Sound/Phoneme Title *", type: "text", placeholder: "e.g., The 'TH' sound" },
      { name: "ipa", label: "IPA Symbol *", type: "text", placeholder: "e.g., /ð/" },
      {
        name: "explanation",
        label: "Pronunciation Explanation *",
        type: "textarea",
        placeholder: "How to pronounce it",
      },
      {
        name: "mouthPosition",
        label: "Mouth Position & Technique *",
        type: "textarea",
        placeholder: "Describe tongue and lip position",
      },
      {
        name: "exampleWords",
        label: "Example Words *",
        type: "textarea",
        placeholder: "Words using this sound (one per line)",
      },
      { name: "audioFile", label: "Audio Examples *", type: "file", accept: ".mp3,.wav" },
      { name: "videoFile", label: "Video Tutorial (Optional)", type: "file", accept: ".mp4,.webm" },
    ],
  },
  listening: {
    name: "Listening",
    icon: "Headphones",
    color: "bg-green-500/20 text-green-600",
    fields: [
      { name: "title", label: "Listening Exercise Title *", type: "text", placeholder: "e.g., Airport Conversation" },
      {
        name: "description",
        label: "Context & Description *",
        type: "textarea",
        placeholder: "Set the scene for the audio",
      },
      { name: "audioFile", label: "Audio File *", type: "file", accept: ".mp3,.wav" },
      { name: "transcript", label: "Transcript *", type: "textarea", placeholder: "Full text of the audio" },
      {
        name: "questions",
        label: "Comprehension Questions *",
        type: "textarea",
        placeholder: "Q1: ...\nQ2: ...\nQ3: ...",
      },
      { name: "answers", label: "Correct Answers *", type: "textarea", placeholder: "A1: ...\nA2: ...\nA3: ..." },
      {
        name: "vocabulary",
        label: "Key Vocabulary",
        type: "textarea",
        placeholder: "List important words with definitions",
      },
    ],
  },
  speaking: {
    name: "Speaking",
    icon: "MessageSquare",
    color: "bg-pink-500/20 text-pink-600",
    fields: [
      { name: "title", label: "Speaking Exercise Title *", type: "text", placeholder: "e.g., Restaurant Ordering" },
      {
        name: "scenario",
        label: "Scenario Description *",
        type: "textarea",
        placeholder: "Describe the speaking scenario",
      },
      {
        name: "usefulPhrases",
        label: "Useful Phrases & Expressions *",
        type: "textarea",
        placeholder: "Phrases to use (one per line)",
      },
      { name: "dialogue", label: "Sample Dialogue *", type: "textarea", placeholder: "Example conversation" },
      {
        name: "pronunciationTips",
        label: "Pronunciation Tips",
        type: "textarea",
        placeholder: "Key pronunciation points",
      },
      { name: "audioExample", label: "Audio Example (Optional)", type: "file", accept: ".mp3,.wav" },
      {
        name: "assessmentCriteria",
        label: "Assessment Criteria *",
        type: "textarea",
        placeholder: "How it will be evaluated",
      },
    ],
  },
  lessons: {
    name: "Lessons",
    icon: "BookOpen",
    color: "bg-indigo-500/20 text-indigo-600",
    fields: [
      { name: "lessonTitle", label: "Lesson Title *", type: "text", placeholder: "Enter lesson name" },
      {
        name: "objectives",
        label: "Learning Objectives *",
        type: "textarea",
        placeholder: "What students will learn (one per line)",
      },
      { name: "content", label: "Lesson Content *", type: "textarea", placeholder: "Main lesson material" },
      {
        name: "sections",
        label: "Lesson Sections (Optional)",
        type: "textarea",
        placeholder: "Divide into sections (one per line)",
      },
      { name: "examples", label: "Real-world Examples *", type: "textarea", placeholder: "Practical examples" },
      {
        name: "activities",
        label: "Interactive Activities *",
        type: "textarea",
        placeholder: "Classroom activities and exercises",
      },
      { name: "quizFile", label: "Quiz/Assessment File (Optional)", type: "file", accept: ".pdf" },
      {
        name: "resources",
        label: "Additional Resources (URLs)",
        type: "textarea",
        placeholder: "Links to resources (one per line)",
      },
    ],
  },
}

export type ContentType = keyof typeof contentTypeDefinitions
export type ContentTypeConfig = (typeof contentTypeDefinitions)[ContentType]
