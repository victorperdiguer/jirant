export const defaultTemplates = [
  {
    name: "Bug Report",
    description: "Report a software bug or issue",
    details: "Use this template to report bugs with detailed steps to reproduce",
    templateStructure: [
      {
        sectionTitle: "Description",
        content: "Describe the bug and its impact"
      },
      {
        sectionTitle: "Steps to Reproduce",
        content: "List the steps to reproduce the issue"
      },
      {
        sectionTitle: "Expected Behavior",
        content: "What should happen?"
      }
    ],
    icon: "bug",
    color: "text-red-500",
    tier: 1
  },
  {
    name: "Feature Request",
    description: "Suggest a new feature or enhancement",
    details: "Use this template to propose new features",
    templateStructure: [
      {
        sectionTitle: "Description",
        content: "Describe the feature you'd like"
      },
      {
        sectionTitle: "Use Case",
        content: "Explain how this would be useful"
      }
    ],
    icon: "lightbulb",
    color: "text-yellow-500",
    tier: 2
  },
  {
    name: "Task",
    description: "Create a general task or to-do item",
    details: "Use this template for general tasks and todos",
    templateStructure: [
      {
        sectionTitle: "Description",
        content: "What needs to be done?"
      },
      {
        sectionTitle: "Acceptance Criteria",
        content: "What are the requirements?"
      }
    ],
    icon: "task",
    color: "text-blue-500",
    tier: 3
  }
]; 