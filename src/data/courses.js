// src/data/courses.js
import itImg from "../assets/it.webp";
import projectImg from "../assets/project.webp";
import electricalImg from "../assets/electrical.webp";
import lawImg from "../assets/law.webp";

const courses = Object.freeze([
  {
    slug: "quantity-surveying",
    title: "PG Programme in Quantity Surveying & Contract Management",
    category: "Information Technology",
    mode: "Online",
    audience: "Working Professionals",

    short: "Online | Working Professionals",
    description:
      "Full program on quantity surveying, contracts and software tools.",

    info: `This program is designed to provide learners with a deep understanding of industry practices and modern tools.
It combines theoretical foundations with hands-on training to build strong practical competence.
Throughout the course, students explore real-world case studies and project-based applications.
The curriculum emphasizes analytical thinking, problem-solving, and decision-making skills.
Learners are guided through essential concepts step-by-step to ensure clarity and mastery.
Industry experts contribute with insights into current trends and professional expectations.
Interactive sessions, assignments, and assessments enhance engagement and learning retention.
Students will develop technical, managerial, and professional communication skills.
The program prepares learners to confidently face workplace challenges and industry roles.
By the end, participants emerge with job-ready skills and a strong foundational understanding.`,

    img: itImg,
    imageAlt:
      "PG Programme in Quantity Surveying and Contract Management course",

    duration: "2 Years",
    level: "Postgraduate",
    professors: ["Jimmy Morris", "Sarah Lewis"],
    tags: ["Quantity Surveying", "Contract Management", "Construction"],
    date: "07 August 2021",
    price: 1500,
    discount: 10,
    tax: 18,
  },

  {
    slug: "project-management",
    title: "PG Programme in Project Management for Working Professionals",
    category: "Information Technology",
    mode: "Online",
    audience: "Professionals",

    short: "Online | Professional Level",
    description:
      "Project management fundamentals, Agile, and practical tools.",

    info: `This program is designed to provide learners with a deep understanding of industry practices and modern tools.
It combines theoretical foundations with hands-on training to build strong practical competence.
Throughout the course, students explore real-world case studies and project-based applications.
The curriculum emphasizes analytical thinking, problem-solving, and decision-making skills.
Learners are guided through essential concepts step-by-step to ensure clarity and mastery.
Industry experts contribute with insights into current trends and professional expectations.
Interactive sessions, assignments, and assessments enhance engagement and learning retention.
Students will develop technical, managerial, and professional communication skills.
The program prepares learners to confidently face workplace challenges and industry roles.
By the end, participants emerge with job-ready skills and a strong foundational understanding.`,

    img: projectImg,
    imageAlt:
      "PG Programme in Project Management for working professionals",

    duration: "1 Year",
    level: "Postgraduate",
    professors: ["Anil Kumar", "Priya Singh"],
    tags: ["Project Management", "Agile", "Scrum"],
    date: "10 August 2021",
    price: 1800,
    discount: 5,
    tax: 18,
  },

  {
    slug: "construction-management",
    title: "PG Programme in Construction Management for Working Professionals",
    category: "Information Technology",
    mode: "Hybrid",
    audience: "Working Professionals",

    short: "Hybrid | Weekend Classes",
    description:
      "Construction project planning, scheduling and site management.",

    info: `This program is designed to provide learners with a deep understanding of industry practices and modern tools.
It combines theoretical foundations with hands-on training to build strong practical competence.
Throughout the course, students explore real-world case studies and project-based applications.
The curriculum emphasizes analytical thinking, problem-solving, and decision-making skills.
Learners are guided through essential concepts step-by-step to ensure clarity and mastery.
Industry experts contribute with insights into current trends and professional expectations.
Interactive sessions, assignments, and assessments enhance engagement and learning retention.
Students will develop technical, managerial, and professional communication skills.
The program prepares learners to confidently face workplace challenges and industry roles.
By the end, participants emerge with job-ready skills and a strong foundational understanding.`,

    img: electricalImg,
    imageAlt:
      "PG Programme in Construction Management course details",

    duration: "2 Years",
    level: "Postgraduate",
    professors: ["Rohit Mehta", "Sneha Chauhan"],
    tags: ["Construction", "Management", "Planning"],
    date: "10 August 2021",
    price: 1700,
    discount: 8,
    tax: 18,
  },

  {
    slug: "law-internship",
    title: "Law Internship Programme",
    category: "Law",
    mode: "Offline / Online",
    audience: "Law Students",

    short: "Offline / Online | 6 Weeks",
    description:
      "Practical law internship with case studies and drafting tasks.",

    info: `This program is designed to provide learners with a deep understanding of industry practices and modern tools.
It combines theoretical foundations with hands-on training to build strong practical competence.
Throughout the course, students explore real-world case studies and project-based applications.
The curriculum emphasizes analytical thinking, problem-solving, and decision-making skills.
Learners are guided through essential concepts step-by-step to ensure clarity and mastery.
Industry experts contribute with insights into current trends and professional expectations.
Interactive sessions, assignments, and assessments enhance engagement and learning retention.
Students will develop technical, managerial, and professional communication skills.
The program prepares learners to confidently face workplace challenges and industry roles.
By the end, participants emerge with job-ready skills and a strong foundational understanding.`,

    img: lawImg,
    imageAlt: "Law internship programme with case studies",

    duration: "6 Weeks",
    level: "Internship",
    professors: ["Adv. Kavita Sharma", "Adv. Deepak Verma"],
    tags: ["Law", "Internship", "Case Studies"],
    date: "11 August 2021",
    price: 900,
    discount: 0,
    tax: 18,
  },
]);

export default courses;
