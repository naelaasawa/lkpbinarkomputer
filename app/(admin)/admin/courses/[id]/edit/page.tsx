"use client";

import CourseBuilder from "@/components/admin/CourseBuilder";
import { useEffect, useState, use } from "react";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                } else {
                    console.error("Failed to fetch course");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading course data...</div>;
    if (!course) return <div className="p-10 text-center text-red-500">Course not found</div>;

    return <CourseBuilder mode="edit" initialData={course} />;
}
