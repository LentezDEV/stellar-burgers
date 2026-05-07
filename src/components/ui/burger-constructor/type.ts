type TOrderModalData = {
  number: number;
};

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrderModalData | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
