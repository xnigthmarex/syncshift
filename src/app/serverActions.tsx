"use server"
import  prisma  from '@/lib/prisma';
// Define the return type for better type checking

export const createTask = async (task: string, dateStarted: string, userId: string): Promise<number > => {
  try {
    // Validate that the userId exists in the User table
    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      return 0;
    }

    // Create the task history
    const newTaskHistory = await prisma.taskHistory.create({
      data: {
        task,
        dateStarted, // Convert to a Date object
        userId,
      },
    });

    return  newTaskHistory.id ; // Return the id of the newly created TaskHistory
  } catch (error) {
    console.error('An error occurred while creating the task:', error);
    return 0;
  }
};

export const updateTaskHistory = async (taskId: number, dateEnded: string, time: string) => {
  try {
    // Update the task history
    await prisma.taskHistory.update({
      where: {
        id: taskId,
      },
      data: {
        dateEnded, // Convert to a Date object
        timeSpent:time,
        wasStopped:true
      },
    });
  } catch (error) {
    console.error('An error occurred while updating the task:', error);
  }
}

//getting all the taskHistory of a user user is is a striing
export const getTaskHistory = async (userId: string) => {
  
  try {
    // Get the latest 10 task history records of the user
    const taskHistory = await prisma.taskHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        dateStarted: 'desc', // Sort by dateStarted in descending order to get the latest records
      },
      take: 5, // Limit the number of records to 10
    });
    
    return taskHistory;
  } catch (error) {
    console.error('An error occurred while getting the task history:', error);
    return [];
  }
};
