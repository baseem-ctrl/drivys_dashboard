import { useParams } from 'react-router-dom';
import TrainerDeatilsPage from './trainer-details-page';

export const TrainerDetailsPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const trainerId = parseInt(id, 10);

  return <TrainerDeatilsPage trainer_id={trainerId} />;
};
