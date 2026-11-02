export function statistics(items, collections = 0) {
  
  const count = (state) => items.filter((item) => item.estado === state).length;
  
  const rated = items.filter((item) => item.puntuacion !== null);
  
  const ranking = (key) =>
    Object.entries(
      items.reduce((acc, item) => {
        for (const label of item[key] || []) acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  
  return {
    total: items.length,
    completed: count('Terminado'),
    playing: count('Jugando'),
    backlog: count('Quiero jugar'),
    abandoned: count('Abandonado'),
    favorites: items.filter((i) => i.esFavorito).length,
    hours: items.reduce((n, i) => n + Number(i.horas), 0),
    average: rated.length
      ? Number((rated.reduce((n, i) => n + i.puntuacion, 0) / rated.length).toFixed(1))
      : 0,
    reviews: items.filter((i) => i.resena).length,
    completion: items.length ? Math.round((count('Terminado') / items.length) * 100) : 0,
    collections,
    genres: ranking('generos'),
    platforms: ranking('plataformas'),
  };
}
