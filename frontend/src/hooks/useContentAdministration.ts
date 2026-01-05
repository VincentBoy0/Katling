import { Topic, Lesson, LessonSection, Question } from "@/types/content";
import { useState, useEffect } from "react";
import { contentService } from "@/services/contentService";
import { get } from "http";

export function useContentAdministraion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [topic, setTopic] = useState<Topic[]>([]);
    const [lesson, setLesson] = useState<Lesson[]>([]);
    const [section, setSection] = useState<LessonSection[]>([]);
    const [question, setQuestion] = useState<Question[]>([]);

    const getTopicsByCreator = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getTopicsByCreator(userId);
            setTopic(data);
        } catch (err) {
            setError("Failed to load topics.");
        } finally {
            setLoading(false);
        }
    };

    const getAllTopics = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getAllTopics();
            setTopic(data);
        } catch (err) {
            setError("Failed to load topics.");
        } finally {
            setLoading(false);
        }
    };

    const getTopicById = async (topicId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getTopicById(topicId);
            setTopic([data]);
        } catch (err) {
            setError("Failed to load topic.");
        } finally {
            setLoading(false);
        }
    };

    const getAllLessons = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getAllLessons();
            setLesson(data);
        } catch (err) {
            setError("Failed to load lessons.");
        } finally {
            setLoading(false);
        }  
    };

    const getLessonsByTopic = async (topicId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getLessonsByTopic(topicId);
            setLesson(data);
        } catch (err) {
            setError("Failed to load lessons.");
        } finally {
            setLoading(false);
        }
    };

    const getLessonsByCreator = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getLessonsByCreator(userId);
            setLesson(data);
        } catch (err) {
            setError("Failed to load lessons.");
        } finally {
            setLoading(false);
        }
    };

    const getLessonById = async (lessonId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getLessonById(lessonId);
            setLesson([data]);
        } catch (err) {
            setError("Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    const getAllSections = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getAllSections();
            setSection(data);
        } catch (err) {
            setError("Failed to load sections.");
        } finally {
            setLoading(false);
        }
    };

    const getSectionsByLesson = async (lessonId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getSectionsByLesson(lessonId);
            setSection(data);
        } catch (err) {
            setError("Failed to load sections.");
        } finally {
            setLoading(false);
        }
    };

    const getSectionsByCreator = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getSectionsByCreator(userId);
            setSection(data);
        } catch (err) {
            setError("Failed to load sections.");
        } finally {
            setLoading(false);
        }
    };

    const getSectionById = async (sectionId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getSectionById(sectionId);
            setSection([data]);
        } catch (err) {
            setError("Failed to load section.");
        } finally {
            setLoading(false);
        }
    };

    const getQuestionById = async (questionId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getQuestionById(questionId);
            setQuestion([data]);
        } catch (err) {
            setError("Failed to load question.");
        } finally {
            setLoading(false);
        }
    };

    const getQuestionsBySection = async (sectionId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getQuestionsBySection(sectionId);
            setQuestion(data);
        } catch (err) {
            setError("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (questionId: number) => {
        setLoading(true);
        setError(null);
        try {
            await contentService.deleteQuestion(questionId);
            setQuestion(qs => qs.filter(q => q.id !== questionId));
        } catch (err) {
            setError("Failed to delete question.");
        } finally {
            setLoading(false);
        }
    };

    const restoreQuestion = async (questionId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.restoreQuestion(questionId);
            setQuestion(qs => [...qs, data]);
        } catch (err) {
            setError("Failed to restore question.");
        } finally {
            setLoading(false);
        }
    };

    const getAllQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await contentService.getAllQuestions();
            setQuestion(data);
        } catch (err) {
            setError("Failed to load questions.");
        }  finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllLessons();
    })
    
    return {
        loading,
        error,
        topic,
        lesson,
        section,
        question,
        getTopicsByCreator,
        getAllTopics,
        getTopicById,
        getAllLessons,
        getLessonsByTopic,
        getLessonsByCreator,
        getLessonById,
        getAllSections,
        getSectionsByLesson,
        getSectionsByCreator,
        getSectionById,
        getQuestionById,
        getQuestionsBySection,
        deleteQuestion,
        restoreQuestion,
        getAllQuestions,
    }
}