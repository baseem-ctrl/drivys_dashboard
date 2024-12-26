import { endpoints, drivysCreator } from 'src/utils/axios';

export async function sendNotification(notificationData: Body) {
  const URL = endpoints.school.messageToTrainer;
  try {
    const response = await drivysCreator([URL, notificationData]);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
// Function to create a reward
export async function createReward(rewardData: {
  user_id: string;
  amount: number;
  reason: string;
}) {
  const URL = endpoints.school.createRewardTrainer;
  try {
    const response = await drivysCreator([URL, rewardData]);
    return response;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}
