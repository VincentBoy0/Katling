import { Topic, Lesson, LessonSection, Question } from "@/types/content";
import { useState, useEffect } from "react";
import { contentService } from "@/services/contentService";

export function useContentAdministraion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [topics, setTopics] = useState<Topic[]>([]);
    const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
    const [sections, setSections] = useState<Record<number, LessonSection[]>>({});
    const [questions, setQuestions] = useState<Record<number, (Question & { is_deleted?: boolean })[]>>({});

    // Load all topics on mount
    useEffect(() => {
        getAllTopics();
    }, []);

    const getAllTopics = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getAllTopics();
            setTopics(data);
        } catch (err) {
            setError("Failed to load topics");
        } finally {
            setLoading(false);
        }
    };

    const getLessonsByTopic = async (topicId: number) => {
        if (lessons[topicId]) return; // Already loaded
        
        try {
            const { data } = await contentService.getLessonsByTopic(topicId, { include_deleted: true });
            setLessons(prev => ({ ...prev, [topicId]: data }));
        } catch (err) {
            console.error("Failed to load lessons:", err);
        }
    };

    const getSectionsByLesson = async (lessonId: number) => {
        if (sections[lessonId]) return; // Already loaded
        
        try {
            const { data } = await contentService.getSectionsByLesson(lessonId, { include_deleted: true });
            setSections(prev => ({ ...prev, [lessonId]: data }));
        } catch (err) {
            console.error("Failed to load sections:", err);
        }
    };

    const getQuestionsBySection = async (sectionId: number) => {
        if (questions[sectionId]) return; // Already loaded
        
        try {
            const { data } = await contentService.getQuestionsBySection(sectionId);
            setQuestions(prev => ({ ...prev, [sectionId]: data }));
        } catch (err) {
            console.error("Failed to load questions:", err);
        }
    };

    const deleteQuestion = async (questionId: number) => {
        await contentService.deleteQuestion(questionId);
        
        // Update local state
        setQuestions(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(sectionId => {
                updated[Number(sectionId)] = updated[Number(sectionId)].map(q =>
                    q.id === questionId ? { ...q, is_deleted: true } : q
                );
            });
            return updated;
        });
    };

    const restoreQuestion = async (questionId: number) => {
        await contentService.restoreQuestion(questionId);
        
        // Update local state
        setQuestions(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(sectionId => {
                updated[Number(sectionId)] = updated[Number(sectionId)].map(q =>
                    q.id === questionId ? { ...q, is_deleted: false } : q
                );
            });
            return updated;
        });
    };

    // Auto-load nested data when parent is expanded
    useEffect(() => {
        topics.forEach(topic => {
            if (!lessons[topic.id]) {
                getLessonsByTopic(topic.id);
            }
        });
    }, [topics]);
    
    return {
        loading,
        error,
        topics,
        lessons,
        sections,
        questions,
        getAllTopics,
        getLessonsByTopic,
        getSectionsByLesson,
        getQuestionsBySection,
        deleteQuestion,
        restoreQuestion,
    };
}