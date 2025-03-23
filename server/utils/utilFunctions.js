// sort array
const sortReportByProjects =(reportData) => {
    const sortedByProjects = [];

    reportData.forEach(entry => {
        // Convert projectId and userId to strings if they exist
        const projectId = entry.projectId ? entry.projectId.toString() : null;
        const userId = entry.userId ? entry.userId.toString() : null;

        // Find or create the project group in the array
        let projectGroup = sortedByProjects.find(group => group.projectId === projectId);
        if (!projectGroup) {
            projectGroup = { projectId: projectId, users: [] };
            sortedByProjects.push(projectGroup);
        }

        // Add the user to the project group, if the user is not already in the list
        let userGroup = projectGroup.users.find(user => user.userId === userId);
        if (!userGroup) {
            userGroup = { userId: userId, durations: [] };
            projectGroup.users.push(userGroup);
        }

        // Add the user's duration info to the user group
        userGroup.durations.push(entry);
    });

    // Sort the projects by their projectId
    sortedByProjects.sort((a, b) => {
        // Handle cases where projectId is null
        if (a.projectId === null && b.projectId === null) return 0;
        if (a.projectId === null) return 1;  // Move null to the end (or -1 to move it to the start)
        if (b.projectId === null) return -1; // Move null to the end (or 1 to move it to the start)

        return a.projectId.localeCompare(b.projectId);
    });

    // Sort users within each project by userId
    sortedByProjects.forEach(project => {
        project.users.sort((a, b) => {
            // Handle cases where userId is null
            if (a.userId === null && b.userId === null) return 0;
            if (a.userId === null) return 1;  // Move null to the end (or -1 to move it to the start)
            if (b.userId === null) return -1; // Move null to the end (or 1 to move it to the start)

            return a.userId.localeCompare(b.userId);
        });
    });

    return sortedByProjects;
}


// sort array
const sortReportByUsers = (reportData) =>{
    const sortedByUsers = [];

    // Group by users and sort projects within each user
    reportData.forEach(entry => {
        // Handle null values for projectId and userId
        const projectId = entry.projectId ? entry.projectId.toString() : null;
        const userId = entry.userId ? entry.userId.toString() : null;

        // Find or create the user group in the array
        let userGroup = sortedByUsers.find(group => group.userId === userId);
        if (!userGroup) {
            userGroup = { userId: userId, projects: [] };
            sortedByUsers.push(userGroup);
        }

        // Add the project to the user group, if the project is not already in the list
        let projectGroup = userGroup.projects.find(project => project.projectId === projectId);
        if (!projectGroup) {
            projectGroup = { projectId: projectId, durations: [] };
            userGroup.projects.push(projectGroup);
        }

        // Add the project's duration info to the project group
        projectGroup.durations.push(entry);
    });

    // Sort users by userId, handling null values
    sortedByUsers.sort((a, b) => {
        if (a.userId === null && b.userId === null) return 0;
        if (a.userId === null) return 1;  // Move null to the end (or -1 to move it to the start)
        if (b.userId === null) return -1; // Move null to the end (or 1 to move it to the start)

        return a.userId.localeCompare(b.userId);
    });

    // Sort projects within each user by projectId, handling null values
    sortedByUsers.forEach(user => {
        user.projects.sort((a, b) => {
            if (a.projectId === null && b.projectId === null) return 0;
            if (a.projectId === null) return 1;  // Move null to the end (or -1 to move it to the start)
            if (b.projectId === null) return -1; // Move null to the end (or 1 to move it to the start)

            return a.projectId.localeCompare(b.projectId);
        });
    });

    return sortedByUsers;
}
const sortReportByTasks = (reportData) =>{
    const sortedData = reportData.reduce((acc, item) => {
        // Check if the task is already in the accumulator
        const taskIndex = acc.findIndex(task => task.taskId.toString() === item.taskId.toString());

        if (taskIndex === -1) {
            // If task doesn't exist in the accumulator, add it
            acc.push({
                taskId: item.taskId,
                taskName: item.taskId.name,
                totalDuration: item.totalDuration,
                users: [
                    {
                        userId: item.userId,
                        userName: item.userId.name,
                        totalDuration: item.totalDuration,
                        period: item.period
                    }
                ]
            });
        } else {
            // If task exists, add the user data to the existing task
            acc[taskIndex].totalDuration += item.totalDuration;
            acc[taskIndex].users.push({
                userId: item.userId,
                userName: item.userId.name,
                totalDuration: item.totalDuration,
                period: item.period
            });
        }

        return acc;
    }, []);

    // Sort the result by task name or totalDuration if needed
    sortedData.sort((a, b) => a.taskName.localeCompare(b.taskName));

    return sortedData;
}


export {sortReportByProjects, sortReportByUsers, sortReportByTasks}