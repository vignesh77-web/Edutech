const TestSeries = require("../models/TestSeries");
const User = require("../models/User");

// Create a new Test Series
exports.createTestSeries = async (req, res) => {
    try {
        const { title, description, price, tests, status } = req.body;
        const instructorId = req.user.id; // From auth middleware

        if (!title || !price) {
            return res.status(400).json({
                success: false,
                message: "Title and price are required fields."
            });
        }

        const newTestSeries = await TestSeries.create({
            title,
            description,
            price,
            tests: tests ? JSON.parse(tests) : [],
            instructor: instructorId,
            status: status || "Draft",
        });

        res.status(200).json({
            success: true,
            data: newTestSeries,
            message: "Test Series created successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create Test Series",
            error: error.message,
        });
    }
};

// Get all Test Series for the logged-in Instructor
exports.getInstructorTestSeries = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const testSeries = await TestSeries.find({ instructor: instructorId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: testSeries,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch instructor test series",
            error: error.message,
        });
    }
};

// Update a Test Series
exports.updateTestSeries = async (req, res) => {
    try {
        const { testSeriesId } = req.body;
        const updates = req.body;
        const instructorId = req.user.id;

        const testSeries = await TestSeries.findById(testSeriesId);

        if (!testSeries) {
            return res.status(404).json({ error: "Test Series not found" });
        }

        // Check if the instructor owns the test series
        if (testSeries.instructor.toString() !== instructorId) {
            return res.status(403).json({ error: "Not authorized to update this test series" });
        }

        if (updates.tests) {
            updates.tests = JSON.parse(updates.tests);
        }

        const updatedTestSeries = await TestSeries.findByIdAndUpdate(
            testSeriesId,
            updates,
            { new: true }
        );

        res.json({
            success: true,
            message: "Test Series updated successfully",
            data: updatedTestSeries,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update Test Series",
            error: error.message,
        });
    }
};

// Delete a Test Series
exports.deleteTestSeries = async (req, res) => {
    try {
        const { testSeriesId } = req.body;
        const instructorId = req.user.id;

        const testSeries = await TestSeries.findById(testSeriesId);

        if (!testSeries) {
            return res.status(404).json({ message: "Test Series not found" });
        }

        if (testSeries.instructor.toString() !== instructorId) {
            return res.status(403).json({ message: "Not authorized to delete this test series" });
        }

        await TestSeries.findByIdAndDelete(testSeriesId);

        res.status(200).json({
            success: true,
            message: "Test Series deleted successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete test series",
            error: error.message,
        });
    }
};

// Get all Published Test Series (For Students exploring)
exports.getAllPublicTestSeries = async (req, res) => {
    try {
        const testSeries = await TestSeries.find({ status: "Published" })
            .populate("instructor", "firstName lastName")
            .populate("studentsEnrolled", "firstName lastName")
            .exec();

        res.status(200).json({
            success: true,
            data: testSeries,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch public test series",
            error: error.message,
        });
    }
};

// Add a specific test to an existing Test Series
exports.addTestToSeries = async (req, res) => {
    try {
        const { testSeriesId, testTitle, questions } = req.body;
        const instructorId = req.user.id;

        if (!testSeriesId || !testTitle || !questions) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: testSeriesId, testTitle, or questions",
            });
        }

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            return res.status(404).json({ success: false, message: "Test Series not found" });
        }

        if (testSeries.instructor.toString() !== instructorId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;

        testSeries.tests.push({
            title: testTitle,
            questions: parsedQuestions,
        });

        await testSeries.save();

        res.status(200).json({
            success: true,
            message: "Test added successfully",
            data: testSeries,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to add test",
            error: error.message,
        });
    }
};

// Evaluate a student's attempt at a test
exports.evaluateTest = async (req, res) => {
    try {
        const { testSeriesId, testId, studentAnswers } = req.body;
        const userId = req.user.id;

        if (!testSeriesId || !testId || !studentAnswers) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            return res.status(404).json({ success: false, message: "Test Series not found" });
        }

        // Optional: Check if student is enrolled
        if (!testSeries.studentsEnrolled.includes(userId)) {
            return res.status(403).json({ success: false, message: "You are not enrolled in this test series" });
        }

        const test = testSeries.tests.id(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        let score = 0;
        const results = test.questions.map((q, index) => {
            const isCorrect = q.correctAnswer === studentAnswers[index];
            if (isCorrect) score++;
            return {
                question: q.question,
                isCorrect,
                correctAnswer: q.correctAnswer,
                studentAnswer: studentAnswers[index],
            };
        });

        res.status(200).json({
            success: true,
            data: {
                score,
                totalQuestions: test.questions.length,
                results,
            },
            message: "Test evaluated successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to evaluate test",
            error: error.message,
        });
    }
};
