"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

// Initial data for the application
const initialData = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      password: "admin123",
    },
    {
      id: 2,
      name: "Project Manager",
      email: "pm@example.com",
      role: "project_manager",
      password: "manager123",
    },
    {
      id: 3,
      name: "Team Member",
      email: "team@example.com",
      role: "team_member",
      password: "team123",
    },
    {
      id: 4,
      name: "John Smith",
      email: "john@example.com",
      role: "team_member",
      password: "pass123",
    },
    {
      id: 5,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "team_member",
      password: "pass123",
    },
  ],
  roles: [
    {
      id: 1,
      name: "Senior Developer",
      permissions: [
        "view_projects",
        "view_tasks",
        "update_task_status",
        "view_team_members",
        "view_milestones",
        "view_resources",
        "view_issues",
        "create_issues",
        "update_issue_status",
        "view_consultants",
        "edit_consultants",
      ],
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Technical Lead",
      permissions: [
        "view_projects",
        "edit_projects",
        "view_tasks",
        "create_tasks",
        "edit_tasks",
        "assign_tasks",
        "view_team_members",
        "view_consultants",
        "create_consultants",
        "view_milestones",
        "view_resources",
        "view_issues",
        "create_issues",
        "edit_issues",
        "update_issue_status",
      ],
      createdAt: "2023-01-01T00:00:00.000Z",
    },
  ],
  consultants: [
    {
      id: 1,
      consultantId: "CONS-001",
      name: "David Wilson",
      roleId: "2",
      email: "david.wilson@example.com",
      mobile: "+1-555-123-4567",
      ratePerHour: "75",
      designation: "Senior Developer",
      teamName: "Development Team",
      active: true,
      skills: [
        { id: 1, consultantId: 1, skill: "React" },
        { id: 2, consultantId: 1, skill: "Node.js" },
        { id: 3, consultantId: 1, skill: "TypeScript" },
      ],
    },
    {
      id: 2,
      consultantId: "CONS-002",
      name: "Emily Brown",
      roleId: "3",
      email: "emily.brown@example.com",
      mobile: "+1-555-987-6543",
      ratePerHour: "65",
      designation: "UX Designer",
      teamName: "Design Team",
      active: true,
      skills: [
        { id: 4, consultantId: 2, skill: "UI/UX Design" },
        { id: 5, consultantId: 2, skill: "Figma" },
        { id: 6, consultantId: 2, skill: "Adobe XD" },
      ],
    },
    {
      id: 3,
      consultantId: "CONS-003",
      name: "Michael Chen",
      roleId: "3",
      email: "michael.chen@example.com",
      mobile: "+1-555-456-7890",
      ratePerHour: "70",
      designation: "Backend Developer",
      teamName: "Development Team",
      active: false,
      skills: [
        { id: 7, consultantId: 3, skill: "Java" },
        { id: 8, consultantId: 3, skill: "Spring Boot" },
        { id: 9, consultantId: 3, skill: "SQL" },
      ],
    },
  ],
  projects: [
    {
      id: 1,
      projectId: "PRJ-001",
      name: "Website Redesign",
      active: true,
      budget: "50000",
      budgetFunctionalHours: "200",
      budgetTechnicalHours: "400",
      startDate: "2023-01-15",
      endDate: "2023-06-30",
      isBillable: true,
      clientCode: "CL001",
      clientName: "Acme Corporation",
      clientProjectManager: "John Smith",
      clientPMEmail: "john.smith@acme.com",
      clientSPOC1: "Jane Doe",
      clientSPOC1Email: "jane.doe@acme.com",
      clientSPOC2: "",
      clientSPOC2Email: "",
      projectGroup: "Digital",
      projectType: "Web Development",
      description:
        "Complete redesign of the corporate website with new branding and improved UX.",
      status: "in_progress",
      managerId: "2",
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      projectId: "PRJ-002",
      name: "Mobile App Development",
      active: true,
      budget: "75000",
      budgetFunctionalHours: "300",
      budgetTechnicalHours: "600",
      startDate: "2023-02-01",
      endDate: "2023-08-31",
      isBillable: true,
      clientCode: "CL002",
      clientName: "TechStart Inc",
      clientProjectManager: "Robert Johnson",
      clientPMEmail: "robert@techstart.com",
      clientSPOC1: "Mary Williams",
      clientSPOC1Email: "mary@techstart.com",
      clientSPOC2: "David Brown",
      clientSPOC2Email: "david@techstart.com",
      projectGroup: "Mobile",
      projectType: "App Development",
      description:
        "Development of a cross-platform mobile application for customer engagement.",
      status: "planning",
      managerId: "2",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: 3,
      projectId: "PRJ-003",
      name: "Internal Training Portal",
      active: false,
      budget: "25000",
      budgetFunctionalHours: "100",
      budgetTechnicalHours: "200",
      startDate: "2022-10-01",
      endDate: "2023-03-31",
      isBillable: false,
      clientCode: "INT001",
      clientName: "Internal",
      clientProjectManager: "",
      clientPMEmail: "",
      clientSPOC1: "",
      clientSPOC1Email: "",
      clientSPOC2: "",
      clientSPOC2Email: "",
      projectGroup: "Internal",
      projectType: "Training",
      description:
        "Development of an internal training portal for employee skill development.",
      status: "completed",
      managerId: "2",
      createdAt: "2022-09-15T00:00:00.000Z",
    },
  ],
  tasks: [
    {
      id: 1,
      taskId: "TASK-001",
      title: "Design Homepage Mockup",
      description:
        "Create a responsive mockup for the new homepage design based on the approved wireframes.",
      projectId: "1",
      reportedDate: "2023-01-20",
      createdDate: "2023-01-20",
      startDate: "2023-01-22",
      endDate: "2023-01-29",
      status: "completed",
      taskType: "Design",
      taskNature: "Frontend",
      priority: "high",
      functionalConsultant: "4",
      technicalConsultant: "",
      totalHours: "16",
      estimatedHours: "12",
      billable: true,
      attachments: ["homepage-wireframe.pdf", "brand-guidelines.pdf"],
      active: true,
      createdBy: "2",
      createdAt: "2023-01-20T10:30:00.000Z",
    },
    {
      id: 2,
      taskId: "TASK-002",
      title: "Implement User Authentication",
      description:
        "Implement secure user authentication system with email verification and password reset functionality.",
      projectId: "1",
      reportedDate: "2023-01-25",
      createdDate: "2023-01-25",
      startDate: "2023-02-01",
      endDate: "2023-02-15",
      status: "in_progress",
      taskType: "Development",
      taskNature: "Backend",
      priority: "urgent",
      functionalConsultant: "",
      technicalConsultant: "5",
      totalHours: "20",
      estimatedHours: "40",
      billable: true,
      attachments: ["auth-requirements.docx"],
      active: true,
      createdBy: "2",
      createdAt: "2023-01-25T14:15:00.000Z",
    },
    {
      id: 3,
      taskId: "TASK-003",
      title: "Database Schema Design",
      description:
        "Design the database schema for the mobile application including user profiles, content, and analytics.",
      projectId: "2",
      reportedDate: "2023-02-05",
      createdDate: "2023-02-05",
      startDate: "2023-02-10",
      endDate: "2023-02-20",
      status: "review",
      taskType: "Architecture",
      taskNature: "Database",
      priority: "medium",
      functionalConsultant: "4",
      technicalConsultant: "5",
      totalHours: "12",
      estimatedHours: "10",
      billable: true,
      attachments: ["db-requirements.pdf", "entity-relationship-diagram.png"],
      active: true,
      createdBy: "2",
      createdAt: "2023-02-05T09:45:00.000Z",
    },
    {
      id: 4,
      taskId: "TASK-004",
      title: "Create Training Modules",
      description:
        "Develop interactive training modules for the new employee onboarding process.",
      projectId: "3",
      reportedDate: "2022-11-10",
      createdDate: "2022-11-10",
      startDate: "2022-11-15",
      endDate: "2022-12-15",
      status: "completed",
      taskType: "Content",
      taskNature: "Training",
      priority: "medium",
      functionalConsultant: "4",
      technicalConsultant: "",
      totalHours: "45",
      estimatedHours: "40",
      billable: false,
      attachments: ["training-outline.docx", "module-content.pdf"],
      active: false,
      createdBy: "2",
      createdAt: "2022-11-10T11:20:00.000Z",
    },
    {
      id: 5,
      taskId: "TASK-005",
      title: "API Integration",
      description:
        "Integrate third-party payment gateway API with the mobile application.",
      projectId: "2",
      reportedDate: "2023-03-01",
      createdDate: "2023-03-01",
      startDate: "2023-03-05",
      endDate: "2023-03-20",
      status: "todo",
      taskType: "Development",
      taskNature: "Integration",
      priority: "high",
      functionalConsultant: "",
      technicalConsultant: "5",
      totalHours: "0",
      estimatedHours: "30",
      billable: true,
      attachments: ["api-documentation.pdf"],
      active: true,
      createdBy: "2",
      createdAt: "2023-03-01T15:30:00.000Z",
    },
    {
      id: 6,
      taskId: "TASK-006",
      title: "Research Payment Gateway Options",
      description:
        "Research and compare different payment gateway options for the mobile app.",
      projectId: "2",
      parentTaskId: "5", // This is a subtask of the API Integration task
      reportedDate: "2023-03-02",
      createdDate: "2023-03-02",
      startDate: "2023-03-05",
      endDate: "2023-03-10",
      status: "completed",
      taskType: "Research",
      taskNature: "Integration",
      priority: "high",
      functionalConsultant: "",
      technicalConsultant: "5",
      totalHours: "8",
      estimatedHours: "10",
      billable: true,
      attachments: [],
      active: true,
      createdBy: "2",
      createdAt: "2023-03-02T09:15:00.000Z",
    },
    {
      id: 7,
      taskId: "TASK-007",
      title: "Create API Integration Documentation",
      description:
        "Document the API integration process and requirements for the development team.",
      projectId: "2",
      parentTaskId: "5", // This is a subtask of the API Integration task
      reportedDate: "2023-03-03",
      createdDate: "2023-03-03",
      startDate: "2023-03-10",
      endDate: "2023-03-15",
      status: "todo",
      taskType: "Documentation",
      taskNature: "Integration",
      priority: "medium",
      functionalConsultant: "4",
      technicalConsultant: "",
      totalHours: "0",
      estimatedHours: "5",
      billable: true,
      attachments: [],
      active: true,
      createdBy: "2",
      createdAt: "2023-03-03T11:30:00.000Z",
    },
  ],
  teams: [],
  milestones: [],
  resources: [],
  issues: [],
  clients: [
    {
      id: 1,
      clientId: "CL001",
      name: "Acme Corporation",
      projectName: "Website Redesign",
      active: true,
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      clientId: "CL002",
      name: "TechStart Inc",
      projectName: "Mobile App Development",
      active: true,
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: 3,
      clientId: "CL003",
      name: "Global Solutions Ltd",
      projectName: "ERP Implementation",
      active: false,
      createdAt: "2022-11-10T00:00:00.000Z",
    },
  ],
};

// Add milestones to the initial state
const initialState = {
  projects: [],
  tasks: [],
  teams: [],
  consultants: [],
  issues: [],
  milestones: [],
  loading: true,
  error: null,
};

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Load data from localStorage if available
      const storedData = localStorage.getItem("appData");
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        // Initialize with default data
        localStorage.setItem("appData", JSON.stringify(initialData));
      }
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      localStorage.setItem("appData", JSON.stringify(data));
    }
  }, [data, loading]);

  // Generic CRUD operations
  const createItem = (entityType, item) => {
    setData((prevData) => {
      const newId =
        prevData[entityType].length > 0
          ? Math.max(...prevData[entityType].map((i) => i.id)) + 1
          : 1;

      return {
        ...prevData,
        [entityType]: [...prevData[entityType], { ...item, id: newId }],
      };
    });
  };

  const updateItem = (entityType, id, updates) => {
    setData((prevData) => ({
      ...prevData,
      [entityType]: prevData[entityType].map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const deleteItem = (entityType, id) => {
    setData((prevData) => ({
      ...prevData,
      [entityType]: prevData[entityType].filter((item) => item.id !== id),
    }));
  };

  const getItems = (entityType) => {
    return data[entityType] || [];
  };

  const getItemById = (entityType, id) => {
    return data[entityType]?.find((item) => item.id === id) || null;
  };

  // Add milestones to the fetchData function
  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true }));

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockProjects = [
        {
          id: 1,
          projectId: "PRJ-001",
          name: "Website Redesign",
          active: true,
          budget: "50000",
          budgetFunctionalHours: "200",
          budgetTechnicalHours: "400",
          startDate: "2023-01-15",
          endDate: "2023-06-30",
          isBillable: true,
          clientCode: "CL001",
          clientName: "Acme Corporation",
          clientProjectManager: "John Smith",
          clientPMEmail: "john.smith@acme.com",
          clientSPOC1: "Jane Doe",
          clientSPOC1Email: "jane.doe@acme.com",
          clientSPOC2: "",
          clientSPOC2Email: "",
          projectGroup: "Digital",
          projectType: "Web Development",
          description:
            "Complete redesign of the corporate website with new branding and improved UX.",
          status: "in_progress",
          managerId: "2",
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          projectId: "PRJ-002",
          name: "Mobile App Development",
          active: true,
          budget: "75000",
          budgetFunctionalHours: "300",
          budgetTechnicalHours: "600",
          startDate: "2023-02-01",
          endDate: "2023-08-31",
          isBillable: true,
          clientCode: "CL002",
          clientName: "TechStart Inc",
          clientProjectManager: "Robert Johnson",
          clientPMEmail: "robert@techstart.com",
          clientSPOC1: "Mary Williams",
          clientSPOC1Email: "mary@techstart.com",
          clientSPOC2: "David Brown",
          clientSPOC2Email: "david@techstart.com",
          projectGroup: "Mobile",
          projectType: "App Development",
          description:
            "Development of a cross-platform mobile application for customer engagement.",
          status: "planning",
          managerId: "2",
          createdAt: "2023-01-15T00:00:00.000Z",
        },
        {
          id: 3,
          projectId: "PRJ-003",
          name: "Internal Training Portal",
          active: false,
          budget: "25000",
          budgetFunctionalHours: "100",
          budgetTechnicalHours: "200",
          startDate: "2022-10-01",
          endDate: "2023-03-31",
          isBillable: false,
          clientCode: "INT001",
          clientName: "Internal",
          clientProjectManager: "",
          clientPMEmail: "",
          clientSPOC1: "",
          clientSPOC1Email: "",
          clientSPOC2: "",
          clientSPOC2Email: "",
          projectGroup: "Internal",
          projectType: "Training",
          description:
            "Development of an internal training portal for employee skill development.",
          status: "completed",
          managerId: "2",
          createdAt: "2022-09-15T00:00:00.000Z",
        },
      ];

      const mockTasks = [
        {
          id: 1,
          taskId: "TASK-001",
          title: "Design Homepage Mockup",
          description:
            "Create a responsive mockup for the new homepage design based on the approved wireframes.",
          projectId: "1",
          reportedDate: "2023-01-20",
          createdDate: "2023-01-20",
          startDate: "2023-01-22",
          endDate: "2023-01-29",
          status: "completed",
          taskType: "Design",
          taskNature: "Frontend",
          priority: "high",
          functionalConsultant: "4",
          technicalConsultant: "",
          totalHours: "16",
          estimatedHours: "12",
          billable: true,
          attachments: ["homepage-wireframe.pdf", "brand-guidelines.pdf"],
          active: true,
          createdBy: "2",
          createdAt: "2023-01-20T10:30:00.000Z",
        },
        {
          id: 2,
          taskId: "TASK-002",
          title: "Implement User Authentication",
          description:
            "Implement secure user authentication system with email verification and password reset functionality.",
          projectId: "1",
          reportedDate: "2023-01-25",
          createdDate: "2023-01-25",
          startDate: "2023-02-01",
          endDate: "2023-02-15",
          status: "in_progress",
          taskType: "Development",
          taskNature: "Backend",
          priority: "urgent",
          functionalConsultant: "",
          technicalConsultant: "5",
          totalHours: "20",
          estimatedHours: "40",
          billable: true,
          attachments: ["auth-requirements.docx"],
          active: true,
          createdBy: "2",
          createdAt: "2023-01-25T14:15:00.000Z",
        },
        {
          id: 3,
          taskId: "TASK-003",
          title: "Database Schema Design",
          description:
            "Design the database schema for the mobile application including user profiles, content, and analytics.",
          projectId: "2",
          reportedDate: "2023-02-05",
          createdDate: "2023-02-05",
          startDate: "2023-02-10",
          endDate: "2023-02-20",
          status: "review",
          taskType: "Architecture",
          taskNature: "Database",
          priority: "medium",
          functionalConsultant: "4",
          technicalConsultant: "5",
          totalHours: "12",
          estimatedHours: "10",
          billable: true,
          attachments: [
            "db-requirements.pdf",
            "entity-relationship-diagram.png",
          ],
          active: true,
          createdBy: "2",
          createdAt: "2023-02-05T09:45:00.000Z",
        },
        {
          id: 4,
          taskId: "TASK-004",
          title: "Create Training Modules",
          description:
            "Develop interactive training modules for the new employee onboarding process.",
          projectId: "3",
          reportedDate: "2022-11-10",
          createdDate: "2022-11-10",
          startDate: "2022-11-15",
          endDate: "2022-12-15",
          status: "completed",
          taskType: "Content",
          taskNature: "Training",
          priority: "medium",
          functionalConsultant: "4",
          technicalConsultant: "",
          totalHours: "45",
          estimatedHours: "40",
          billable: false,
          attachments: ["training-outline.docx", "module-content.pdf"],
          active: false,
          createdBy: "2",
          createdAt: "2022-11-10T11:20:00.000Z",
        },
        {
          id: 5,
          taskId: "TASK-005",
          title: "API Integration",
          description:
            "Integrate third-party payment gateway API with the mobile application.",
          projectId: "2",
          reportedDate: "2023-03-01",
          createdDate: "2023-03-01",
          startDate: "2023-03-05",
          endDate: "2023-03-20",
          status: "todo",
          taskType: "Development",
          taskNature: "Integration",
          priority: "high",
          functionalConsultant: "",
          technicalConsultant: "5",
          totalHours: "0",
          estimatedHours: "30",
          billable: true,
          attachments: ["api-documentation.pdf"],
          active: true,
          createdBy: "2",
          createdAt: "2023-03-01T15:30:00.000Z",
        },
      ];

      const mockTeams = [];

      const mockConsultants = [
        {
          id: 1,
          consultantId: "CONS-001",
          name: "David Wilson",
          roleId: "2",
          email: "david.wilson@example.com",
          mobile: "+1-555-123-4567",
          ratePerHour: "75",
          designation: "Senior Developer",
          teamName: "Development Team",
          active: true,
          skills: [
            { id: 1, consultantId: 1, skill: "React" },
            { id: 2, consultantId: 1, skill: "Node.js" },
            { id: 3, consultantId: 1, skill: "TypeScript" },
          ],
        },
        {
          id: 2,
          consultantId: "CONS-002",
          name: "Emily Brown",
          roleId: "3",
          email: "emily.brown@example.com",
          mobile: "+1-555-987-6543",
          ratePerHour: "65",
          designation: "UX Designer",
          teamName: "Design Team",
          active: true,
          skills: [
            { id: 4, consultantId: 2, skill: "UI/UX Design" },
            { id: 5, consultantId: 2, skill: "Figma" },
            { id: 6, consultantId: 2, skill: "Adobe XD" },
          ],
        },
        {
          id: 3,
          consultantId: "CONS-003",
          name: "Michael Chen",
          roleId: "3",
          email: "michael.chen@example.com",
          mobile: "+1-555-456-7890",
          ratePerHour: "70",
          designation: "Backend Developer",
          teamName: "Development Team",
          active: false,
          skills: [
            { id: 7, consultantId: 3, skill: "Java" },
            { id: 8, consultantId: 3, skill: "Spring Boot" },
            { id: 9, consultantId: 3, skill: "SQL" },
          ],
        },
      ];

      const mockIssues = [];

      // Add mock milestones
      const mockMilestones = [
        {
          id: "m1",
          title: "Project Kickoff",
          project_id: "p1",
          due_date: "2023-06-15",
          status: "completed",
          description: "Initial project kickoff meeting with stakeholders",
          completion_percentage: 100,
        },
        {
          id: "m2",
          title: "Design Phase Complete",
          project_id: "p1",
          due_date: "2023-07-30",
          status: "completed",
          description: "Finalize all design documents and get approval",
          completion_percentage: 100,
        },
        {
          id: "m3",
          title: "MVP Release",
          project_id: "p1",
          due_date: "2023-09-15",
          status: "in_progress",
          description: "Release minimum viable product to beta testers",
          completion_percentage: 75,
        },
        {
          id: "m4",
          title: "Final Release",
          project_id: "p1",
          due_date: "2023-11-30",
          status: "planning",
          description: "Official product launch",
          completion_percentage: 25,
        },
        {
          id: "m5",
          title: "Requirements Gathering",
          project_id: "p2",
          due_date: "2023-06-20",
          status: "completed",
          description: "Complete requirements documentation",
          completion_percentage: 100,
        },
        {
          id: "m6",
          title: "Phase 1 Delivery",
          project_id: "p2",
          due_date: "2023-08-15",
          status: "in_progress",
          description: "Deliver first phase of the project",
          completion_percentage: 60,
        },
        {
          id: "m7",
          title: "User Acceptance Testing",
          project_id: "p3",
          due_date: "2023-07-10",
          status: "in_progress",
          description: "Complete UAT with client",
          completion_percentage: 80,
        },
      ];

      setData({
        ...data,
        projects: mockProjects,
        tasks: mockTasks,
        teams: mockTeams,
        consultants: mockConsultants,
        issues: mockIssues,
        milestones: mockMilestones,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Add milestones to the value object
  const value = {
    ...data,
    loading,
    createItem,
    updateItem,
    deleteItem,
    getItems,
    getItemById,
    fetchData,
    addProject: () => {},
    updateProject: () => {},
    deleteProject: () => {},
    addTask: () => {},
    updateTask: () => {},
    deleteTask: () => {},
    addTeam: () => {},
    updateTeam: () => {},
    deleteTeam: () => {},
    addConsultant: () => {},
    updateConsultant: () => {},
    deleteConsultant: () => {},
    addIssue: () => {},
    updateIssue: () => {},
    deleteIssue: () => {},
    // Add milestone functions
    addMilestone: (milestone) => {
      setData((prev) => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          { ...milestone, id: `m${Date.now()}` },
        ],
      }));
    },
    updateMilestone: (id, milestone) => {
      setData((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === id ? { ...m, ...milestone } : m
        ),
      }));
    },
    deleteMilestone: (id) => {
      setData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((m) => m.id !== id),
      }));
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
