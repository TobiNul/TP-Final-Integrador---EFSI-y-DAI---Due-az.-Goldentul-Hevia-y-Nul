import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statistics } from '../src/stats.js';

test('estadísticas vacías no producen NaN ni porcentajes ficticios', () => {
  const s = statistics([]);
  
  assert.equal(s.total, 0);
  
  assert.equal(s.average, 0);
  
  assert.equal(s.completion, 0);
  
  assert.deepEqual(s.genres, []);
});
test('estadísticas cambian con puntuaciones, estados, horas y preferencias reales', () => {
  const items = [
    {
      estado: 'Terminado',
      puntuacion: 10,
      resena: 'Muy bueno',
      horas: '10.5',
      esFavorito: true,
      generos: ['RPG'],
      plataformas: ['PC'],
    },
    {
      estado: 'Jugando',
      puntuacion: 8,
      resena: '',
      horas: '2.5',
      esFavorito: false,
      generos: ['RPG', 'Aventura'],
      plataformas: ['PC', 'PS5'],
    },
    {
      estado: 'Quiero jugar',
      puntuacion: null,
      resena: '',
      horas: 0,
      esFavorito: true,
      generos: ['Aventura'],
      plataformas: [],
    },
  ];
  const s = statistics(items, 2);
  
  assert.equal(s.total, 3);
  assert.equal(s.completed, 1);
  assert.equal(s.playing, 1);
  assert.equal(s.backlog, 1);
  assert.equal(s.hours, 13);
  assert.equal(s.average, 9);
  assert.equal(s.completion, 33);
  assert.equal(s.reviews, 1);
  assert.equal(s.favorites, 2);
  assert.equal(s.collections, 2);
  assert.deepEqual(s.platforms[0], { name: 'PC', value: 2 });
  
  items[1].estado = 'Terminado';
  
  assert.equal(statistics(items).completion, 67);
});
