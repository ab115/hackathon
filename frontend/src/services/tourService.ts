import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Utility to wait for an element to appear in the DOM
const waitForElement = (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

export const startAdminTour = (navigate: (path: string) => void) => {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    steps: [
      { 
        element: '#sidebar-dashboard', 
        popover: { 
          title: 'Admin Dashboard', 
          description: 'Welcome! This is your mission control. Monitor hackathon stats, revenue, and system health here.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/admin');
            try {
              await waitForElement('#dashboard-stats');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#dashboard-stats',
        popover: {
          title: 'Quick Stats',
          description: 'Get an immediate overview of total registrations, revenue, and active hackathons.',
          side: 'bottom', align: 'start'
        }
      },
      {
        element: '#dashboard-charts',
        popover: {
          title: 'Analytics & Trends',
          description: 'Visualize platform growth with real-time registration trends and category breakdowns.',
          side: 'top', align: 'start'
        }
      },
      { 
        element: '#sidebar-create', 
        popover: { 
          title: 'Create Hackathon', 
          description: 'Let\'s head over to launch a new challenge.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/admin/create');
            try {
              await waitForElement('#create-hackathon-form');
              driverObj.moveNext();
            } catch (e) {
              driverObj.moveNext();
            }
          }
        }
      },
      { 
        element: '#create-hackathon-form', 
        popover: { 
          title: 'Hackathon Configuration', 
          description: 'Define your event here.',
          side: "top", align: 'start' 
        } 
      },
      { 
        element: '#hackathon-name-input', 
        popover: { 
          title: 'Set the Title', 
          description: 'Give your hackathon a catchy and descriptive name.',
          side: "top", align: 'start' 
        } 
      },
      { 
        element: '#hackathon-fee-input', 
        popover: { 
          title: 'Registration Fee', 
          description: 'Set the entry fee, or leave it at 0 for free entry.',
          side: "top", align: 'start' 
        } 
      },
      { 
        element: '#sidebar-manage', 
        popover: { 
          title: 'Manage Events', 
          description: 'Next, let\'s see how to manage existing hackathons.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/admin/manage');
            try {
              await waitForElement('#manage-hackathons-list');
              driverObj.moveNext();
            } catch (e) {
              driverObj.moveNext();
            }
          }
        }
      },
      { 
        element: '#manage-hackathons-list', 
        popover: { 
          title: 'Active Events', 
          description: 'All your created hackathons appear here.',
          side: "top", align: 'start' 
        } 
      },
      {
        element: '#sidebar-resources',
        popover: {
          title: 'Resources Management',
          description: 'Upload and manage learning materials for participants here.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/admin/resources');
            try {
              await waitForElement('#admin-resources-list');
              driverObj.moveNext();
            } catch(e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#admin-resources-list',
        popover: {
          title: 'Resource Library',
          description: 'All your uploaded resources will be listed here.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-mentors',
        popover: {
          title: 'Mentor Management',
          description: 'Assign and oversee mentors who will guide the teams.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/admin/mentors');
            try {
              await waitForElement('#admin-mentors-list');
              driverObj.moveNext();
            } catch(e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#admin-mentors-list',
        popover: {
          title: 'Registered Mentors',
          description: 'Manage the pool of mentors available to students.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-leaderboard',
        popover: {
          title: 'Global Leaderboard',
          description: 'Monitor the top-performing teams across all events.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/admin/leaderboard');
            try {
              await waitForElement('#admin-leaderboard-view');
              driverObj.moveNext();
            } catch(e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#admin-leaderboard-view',
        popover: {
          title: 'Live Rankings',
          description: 'See real-time points and rankings of all participating teams.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-judging',
        popover: {
          title: 'Judging Portal',
          description: 'Manage submissions and coordinate the evaluation process.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/admin/judging');
            try {
              await waitForElement('#admin-judging-portal');
              driverObj.moveNext();
            } catch(e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#admin-judging-portal',
        popover: {
          title: 'Evaluation View',
          description: 'Review code, rate submissions, and manage judging panels.',
          side: 'top', align: 'start'
        }
      },
      { 
        element: '#sidebar-users', 
        popover: { 
          title: 'Platform Control', 
          description: 'Finally, manage users, assign roles, and control access levels.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/admin/users');
            try {
              await waitForElement('#admin-users-table');
              driverObj.moveNext();
            } catch(e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#admin-users-table',
        popover: {
          title: 'User Management',
          description: 'View all users, update roles, and manage account statuses.',
          side: 'top', align: 'start'
        }
      }
    ]
  });

  driverObj.drive();
};

export const startStudentTour = (navigate: (path: string) => void) => {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    steps: [
      { 
        element: '#sidebar-dashboard', 
        popover: { 
          title: 'Innovator Portal', 
          description: 'Welcome! This is your dashboard showing your points, rank, and active registrations.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/student');
            try {
              await waitForElement('#student-stats');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-stats',
        popover: {
          title: 'Performance Overview',
          description: 'Track your total points, global rank, and active hackathon registrations here.',
          side: 'bottom', align: 'start'
        }
      },
      {
        element: '#student-hackathons',
        popover: {
          title: 'Latest Opportunities',
          description: 'Quickly view and register for the latest open hackathons tailored to you.',
          side: 'top', align: 'start'
        }
      },
      { 
        element: '#sidebar-hackathons', 
        popover: { 
          title: 'Find Challenges', 
          description: 'Let\'s explore the latest hackathons you can join.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/student/hackathons');
            try {
              await waitForElement('#student-search-bar');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      { 
        element: '#student-search-bar', 
        popover: { 
          title: 'Search & Filter', 
          description: 'Easily find hackathons by name or category.',
          side: "bottom", align: 'start' 
        } 
      },
      { 
        element: '#student-hackathons-list', 
        popover: { 
          title: 'Registration Flow', 
          description: 'Browse through open challenges. Each card shows the prize pool, team size, and fee.',
          side: "top", align: 'start' 
        } 
      },
      {
        element: '#hackathon-details-btn',
        popover: {
          title: 'Deep Dive',
          description: 'Click "Details" to see the full problem statement, rules, and timeline.',
          side: 'bottom', align: 'start',
          onNextClick: async () => {
            const btn = document.getElementById('hackathon-details-btn');
            if (btn) btn.click();
            try {
              await waitForElement('#hackathon-details-scroll');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#hackathon-details-scroll',
        popover: {
          title: 'Comprehensive Info',
          description: 'Here you can find the project brief, judging criteria, and ground rules. Take your time to review everything.',
          side: 'left', align: 'start',
          onNextClick: () => {
            const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
              scrollArea.scrollTo({ top: 300, behavior: 'smooth' });
            }
            setTimeout(() => driverObj.moveNext(), 800);
          }
        }
      },
      {
        element: '#close-details-btn',
        popover: {
          title: 'Dismiss Details',
          description: 'Once you have the info you need, close the popup to return to the browse view.',
          side: 'top', align: 'start',
          onNextClick: () => {
            const btn = document.getElementById('close-details-btn');
            if (btn) btn.click();
            setTimeout(() => driverObj.moveNext(), 400);
          }
        }
      },
      { 
        element: '#sidebar-teams', 
        popover: { 
          title: 'Team Building', 
          description: 'Need a team? Let\'s check out the team formation page.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/student/teams');
            try {
              await waitForElement('#create-team-card');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      { 
        element: '#create-team-card', 
        popover: { 
          title: 'Create Your Team', 
          description: 'Start a team here and invite your friends.',
          side: "bottom", align: 'start' 
        } 
      },
      { 
        element: '#ai-recommendations', 
        popover: { 
          title: 'AI Teammate Matching', 
          description: 'Our AI analyzes your skills to suggest perfect teammates. Send invites with a single click!',
          side: "top", align: 'start' 
        } 
      },
      { 
        element: '#sidebar-submissions', 
        popover: { 
          title: 'Showcase Your Work', 
          description: 'Submit your code and demo links here when you\'re ready to compete.',
          side: "right", align: 'start',
          onNextClick: async () => {
            navigate('/student/submissions');
            try {
              await waitForElement('#student-submissions-form');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-submissions-form',
        popover: {
          title: 'Submit Project',
          description: 'Fill out this form with your project details, GitHub URL, and demo link.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-leaderboard',
        popover: {
          title: 'Leaderboard',
          description: 'Track your ranking among all participants.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/student/leaderboard');
            try {
              await waitForElement('#student-leaderboard-view');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-leaderboard-view',
        popover: {
          title: 'Global Rankings',
          description: 'See where you and your team stand against the competition.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-mentorship',
        popover: {
          title: 'Mentorship',
          description: 'Connect with industry experts for guidance.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/student/mentorship');
            try {
              await waitForElement('#student-mentorship-view');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-mentorship-view',
        popover: {
          title: 'Find a Mentor',
          description: 'Browse available mentors and book a session for guidance on your project.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-resources',
        popover: {
          title: 'Resources',
          description: 'Access study materials, templates, and problem statements.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/student/resources');
            try {
              await waitForElement('#student-resources-view');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-resources-view',
        popover: {
          title: 'Learning Hub',
          description: 'Find tutorials, boilerplates, and official documentation to help you build.',
          side: 'top', align: 'start'
        }
      },
      {
        element: '#sidebar-profile',
        popover: {
          title: 'Your Profile',
          description: 'Update your skills, college, and personal info here.',
          side: "right", align: "start",
          onNextClick: async () => {
            navigate('/student/profile');
            try {
              await waitForElement('#student-profile-view');
              driverObj.moveNext();
            } catch (e) { driverObj.moveNext(); }
          }
        }
      },
      {
        element: '#student-profile-view',
        popover: {
          title: 'Profile Settings',
          description: 'Keep your skills, interests, and bio up to date for better team recommendations.',
          side: 'top', align: 'start'
        }
      }
    ]
  });

  driverObj.drive();
};
