import {
  addIngredient,
  constructorReducer,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient
} from '../slices/constructorSlice';
import { TIngredient } from '@utils-types';

const bun: TIngredient = {
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
};

const main: TIngredient = {
  _id: 'main-id',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'main.png',
  image_large: 'main-large.png',
  image_mobile: 'main-mobile.png'
};

const sauce: TIngredient = {
  _id: 'sauce-id',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'sauce.png',
  image_large: 'sauce-large.png',
  image_mobile: 'sauce-mobile.png'
};

describe('constructorReducer', () => {
  test('добавляет булку в конструктор', () => {
    const state = constructorReducer(undefined, addIngredient(bun));

    expect(state.bun).toEqual(
      expect.objectContaining({
        ...bun,
        id: expect.any(String)
      })
    );
    expect(state.ingredients).toEqual([]);
  });

  test('добавляет ингредиент в список начинок', () => {
    const state = constructorReducer(undefined, addIngredient(main));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([
      expect.objectContaining({
        ...main,
        id: expect.any(String)
      })
    ]);
  });

  test('удаляет ингредиент из списка начинок', () => {
    const stateWithIngredient = constructorReducer(
      undefined,
      addIngredient(main)
    );
    const ingredientId = stateWithIngredient.ingredients[0].id;

    const state = constructorReducer(
      stateWithIngredient,
      removeIngredient(ingredientId)
    );

    expect(state.ingredients).toEqual([]);
  });

  test('изменяет порядок ингредиентов в начинке', () => {
    const stateWithFirstIngredient = constructorReducer(
      undefined,
      addIngredient(main)
    );
    const stateWithIngredients = constructorReducer(
      stateWithFirstIngredient,
      addIngredient(sauce)
    );

    const movedUpState = constructorReducer(
      stateWithIngredients,
      moveIngredientUp(1)
    );

    expect(
      movedUpState.ingredients.map((ingredient) => ingredient._id)
    ).toEqual([sauce._id, main._id]);

    const movedDownState = constructorReducer(
      movedUpState,
      moveIngredientDown(0)
    );

    expect(
      movedDownState.ingredients.map((ingredient) => ingredient._id)
    ).toEqual([main._id, sauce._id]);
  });
});
