import {
  fetchIngredients,
  ingredientsReducer
} from '../slices/ingredientsSlice';
import { TIngredient } from '@utils-types';

const ingredients: TIngredient[] = [
  {
    _id: 'bun-id',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun.png',
    image_large: 'bun-large.png',
    image_mobile: 'bun-mobile.png'
  }
];

describe('ingredientsReducer', () => {
  test('обрабатывает начало запроса ингредиентов', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.pending('request-id')
    );

    expect(state).toEqual({
      items: [],
      isLoading: true,
      error: null
    });
  });

  test('обрабатывает успешное выполнение запроса ингредиентов', () => {
    const state = ingredientsReducer(
      {
        items: [],
        isLoading: true,
        error: null
      },
      fetchIngredients.fulfilled(ingredients, 'request-id')
    );

    expect(state).toEqual({
      items: ingredients,
      isLoading: false,
      error: null
    });
  });

  test('обрабатывает ошибку запроса ингредиентов', () => {
    const state = ingredientsReducer(
      {
        items: [],
        isLoading: true,
        error: null
      },
      fetchIngredients.rejected(
        null,
        'request-id',
        undefined,
        'Ошибка загрузки'
      )
    );

    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: 'Ошибка загрузки'
    });
  });
});
