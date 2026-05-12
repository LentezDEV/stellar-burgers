import { rootReducer } from '../store';

describe('rootReducer', () => {
  test('возвращает корректное начальное состояние для неизвестного экшена', () => {
    expect(rootReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual({
      auth: {
        user: null,
        isAuthChecked: false,
        isAuthenticated: false,
        request: false,
        error: null,
        updateUserError: null,
        passwordResetError: null
      },
      burgerConstructor: {
        bun: null,
        ingredients: []
      },
      ingredients: {
        items: [],
        isLoading: false,
        error: null
      },
      orders: {
        feed: {
          orders: [],
          total: 0,
          totalToday: 0
        },
        profileOrders: [],
        currentOrder: null,
        orderModalData: null,
        isFeedLoading: false,
        isProfileOrdersLoading: false,
        isOrderLoading: false,
        orderRequest: false,
        error: null
      }
    });
  });
});
