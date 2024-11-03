export interface UserSchemaTypes {
  _id: string;
  name: string;
  email: string;
  dob: Date;
  photo: string;
  gender: "male" | "female";
  role: "admin" | "user";
  createdAt?: Date;
  updatedAt?: Date;
  age: Date;
}

export interface ProductSchemaTypes {
  name: string;
  price: number;
  stock: number;
  offerPrice: number;
  reviews: [{ name: string; rating: number; comment: string }];
  photos: { publicId: string; url: string }[];
  sizeChartPhoto: { publicId: string; url: string };
  category: string;
  subCategory: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderSchemaTypes {
  userId: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  shippingInfo: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
  };
  cartItem: [
    {
      name: string;
      photo: {
        publicId: string;
        url: string;
      };
      price: number;
      quantity: number;
      stock: number;
      productId: string;
    }
  ];
}
