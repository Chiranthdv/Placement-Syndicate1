require("dotenv").config();

const mongoose = require("mongoose");
const Experience = require("./models/Experience");

const experiences = [
    {
        companyName: "Microsoft",
        role: "Software Engineer Intern",

        quetions: [
            "Explain the time complexity of binary search.",
            "Find the shortest path between two nodes in a graph.",
            "Explain the four principles of OOP.",
            "How does a hash table work?",
            "Solve a problem involving arrays and dynamic programming."
        ],

        tips: [
            "Focus on DSA fundamentals.",
            "Explain your approach before writing code.",
            "Always discuss time and space complexity.",
            "Be comfortable with OOP concepts."
        ],

        difficulty: "Hard",

        rounds: [
            "Online Assessment",
            "Technical Interview 1",
            "Technical Interview 2",
            "HR Interview"
        ]
    },

    {
        companyName: "Amazon",
        role: "Software Development Engineer Intern",

        quetions: [
            "Find the maximum subarray sum.",
            "Detect a cycle in a linked list.",
            "Explain BFS and DFS.",
            "Design a data structure for an LRU cache.",
            "What is the difference between SQL and NoSQL databases?"
        ],

        tips: [
            "Practice arrays, strings, trees and graphs.",
            "Know multiple approaches to common problems.",
            "Explain edge cases clearly.",
            "Be prepared to discuss your projects."
        ],

        difficulty: "Hard",

        rounds: [
            "Online Assessment",
            "Technical Interview 1",
            "Technical Interview 2",
            "Bar Raiser",
            "HR Interview"
        ]
    },

    {
        companyName: "Google",
        role: "Software Engineer Intern",

        quetions: [
            "Find duplicate elements in an array.",
            "Implement a binary search tree operation.",
            "Explain the difference between stack and queue.",
            "Solve a graph traversal problem.",
            "Explain how garbage collection works in Java."
        ],

        tips: [
            "Focus on problem solving rather than memorizing solutions.",
            "Communicate your thought process.",
            "Practice graph and tree problems.",
            "Always analyze complexity."
        ],

        difficulty: "Hard",

        rounds: [
            "Online Assessment",
            "Technical Interview 1",
            "Technical Interview 2",
            "Technical Interview 3"
        ]
    },

    {
        companyName: "Oracle",
        role: "Software Engineer",

        quetions: [
            "Explain normalization in DBMS.",
            "What is the difference between process and thread?",
            "Reverse a linked list.",
            "Explain inheritance and polymorphism.",
            "Write a SQL query using JOIN."
        ],

        tips: [
            "Revise DBMS and Operating Systems.",
            "Practice SQL queries.",
            "Be strong with Java and OOP.",
            "Revise common DSA problems."
        ],

        difficulty: "Medium",

        rounds: [
            "Online Assessment",
            "Technical Interview",
            "Managerial Interview",
            "HR Interview"
        ]
    },

    {
        companyName: "Cisco",
        role: "Software Engineer Intern",

        quetions: [
            "Explain TCP and UDP.",
            "What happens when you enter a URL in a browser?",
            "Implement BFS traversal.",
            "Explain IP addressing.",
            "What is the difference between HTTP and HTTPS?"
        ],

        tips: [
            "Revise Computer Networks.",
            "Practice graph algorithms.",
            "Understand networking fundamentals.",
            "Be ready to explain projects."
        ],

        difficulty: "Medium",

        rounds: [
            "Online Assessment",
            "Technical Interview",
            "Technical Interview",
            "HR Interview"
        ]
    },

    {
        companyName: "Infosys",
        role: "Systems Engineer",

        quetions: [
            "Explain OOP concepts.",
            "What is the difference between ArrayList and LinkedList?",
            "Write a program to check whether a string is a palindrome.",
            "Explain primary key and foreign key.",
            "What is normalization?"
        ],

        tips: [
            "Revise basic DSA.",
            "Be strong in Java fundamentals.",
            "Practice SQL queries.",
            "Know your resume projects well."
        ],

        difficulty: "Easy",

        rounds: [
            "Online Assessment",
            "Technical Interview",
            "HR Interview"
        ]
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const insertedExperiences =
            await Experience.insertMany(experiences);

        console.log(
            `${insertedExperiences.length} experiences inserted successfully`
        );

        await mongoose.disconnect();

        console.log("MongoDB connection closed");
    } catch (error) {
        console.error(
            "Seeding failed:",
            error.message
        );

        process.exit(1);
    }
}

seedDatabase();