import { personalService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import { PageTitle, ErrorBox, Loading, ActivityList, Empty } from '../components/UI';

export default function Activity() {
  
  const { data, error, loading, reload } = useLoad(personalService.activity);
  
  return (
    <>
      <PageTitle
        title="Tu historia gamer"
        eyebrow="ACTIVIDAD"
        description="Cada juego guardado, cada colección y cada aventura completada."
      />
      <section className="panel activity-panel">
        {error ? (
          <ErrorBox message={error} retry={reload} />
        ) : loading ? (
          <Loading />
        ) : data?.length ? (
          <ActivityList items={data} limit={100} />
        ) : (
          <Empty
            title="El comienzo de una gran historia"
            text="Tu actividad aparecerá acá cuando empieces a armar tu biblioteca."
          />
        )}
      </section>
    </>
  );
}
