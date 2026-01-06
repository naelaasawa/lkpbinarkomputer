// Step 6: Settings Component
function Step6Settings({ settings, setSettings, quickPublish }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Settings</h2>
                <p className="text-sm text-slate-500">
                    Control how students can access and complete your course
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Visibility <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    {["draft", "private", "public"].map((vis) => (
                        <label key={vis} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value={vis}
                                checked={settings.visibility === vis}
                                onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                                className="w-4 h-4 text-blue-600"
                                disabled={quickPublish && vis !== "private"}
                            />
                            <div className="flex-1">
                                <div className="font-medium text-slate-800 capitalize">{vis}</div>
                                <div className="text-xs text-slate-500">
                                    {vis === "draft" && "Only you can see this course"}
                                    {vis === "private" && "Visible to enrolled students only"}
                                    {vis === "public" && "Anyone can see and enroll"}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                {quickPublish && (
                    <p className="text-xs text-blue-600 mt-2">🔒 Quick Publish mode: Visibility locked to Private</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Enrollment Type
                </label>
                <select
                    value={settings.enrollmentType}
                    onChange={(e) => setSettings({ ...settings, enrollmentType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="open">Open - Anyone can enroll</option>
                    <option value="approval">Approval Required</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Completion Rule
                </label>
                <select
                    value={settings.completionRule}
                    onChange={(e) => setSettings({ ...settings, completionRule: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={quickPublish}
                >
                    <option value="manual">Manual - You mark as complete</option>
                    <option value="all_lessons">Automatic - All lessons completed</option>
                </select>
                {quickPublish && (
                    <p className="text-xs text-blue-600 mt-1">🔒 Quick Publish mode: Manual completion</p>
                )}
            </div>

            <div>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.certificateEnabled}
                        onChange={(e) => setSettings({ ...settings, certificateEnabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={quickPublish}
                    />
                    <div className="flex-1">
                        <div className="font-semibold text-slate-800">Enable Certificate</div>
                        <div className="text-sm text-slate-500">Award certificate upon course completion</div>
                    </div>
                </label>
                {quickPublish && (
                    <p className="text-xs text-blue-600 mt-2">🔒 Quick Publish mode: Certificate disabled</p>
                )}
            </div>
        </div>
    );
}

// Step 8: Review & Publish Component
function Step8Review({ courseData, modules, settings, quickPublish }: any) {
    const validations = {
        hasTitle: !!courseData.title,
        hasDescription: !!courseData.shortDescription,
        hasCategory: !!courseData.categoryId,
        hasModules: modules.length > 0,
        hasLessons: modules.some((m: any) => m.lessons.length > 0),
    };

    const allValid = Object.values(validations).every(Boolean);
    const totalLessons = modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & Publish</h2>
                <p className="text-sm text-slate-500">
                    Review your course details before publishing
                </p>
            </div>

            {/* Validation Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="font-bold text-slate-800 mb-4">Validation Checklist</h3>
                <div className="space-y-2">
                    <ValidationItem label="Course Title" valid={validations.hasTitle} />
                    <ValidationItem label="Short Description" valid={validations.hasDescription} />
                    <ValidationItem label="Category Selected" valid={validations.hasCategory} />
                    <ValidationItem label="At Least 1 Module" valid={validations.hasModules} />
                    <ValidationItem label="At Least 1 Lesson" valid={validations.hasLessons} />
                </div>

                {!allValid && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        ⚠️ Please complete all required fields before publishing
                    </div>
                )}
                {allValid && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        ✅ All required fields completed! Ready to publish
                    </div>
                )}
            </div>

            {/* Course Summary */}
            <div className="border border-slate-200 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-slate-800 mb-3">Course Summary</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-gray-500">Title</div>
                        <div className="font-medium text-slate-800">{courseData.title || "-"}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Level</div>
                        <div className="font-medium text-slate-800">{courseData.level}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Modules</div>
                        <div className="font-medium text-slate-800">{modules.length}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Total Lessons</div>
                        <div className="font-medium text-slate-800">{totalLessons}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Visibility</div>
                        <div className="font-medium text-slate-800 capitalize">{settings.visibility}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Certificate</div>
                        <div className="font-medium text-slate-800">{settings.certificateEnabled ? "Enabled" : "Disabled"}</div>
                    </div>
                </div>

                {quickPublish && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        ⚡ Quick Publish Mode Active - Course will be created with minimal settings
                    </div>
                )}
            </div>

            {/* Warnings */}
            {modules.some((m: any) => m.lessons.length === 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ Warning: Some modules have no lessons
                </div>
            )}
        </div>
    );
}

// Helper component for validation items
function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${valid ? "bg-green-500" : "bg-slate-300"}`}>
                {valid && <span className="text-white text-xs">✓</span>}
            </div>
            <span className={`text-sm ${valid ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
        </div>
    );
}
