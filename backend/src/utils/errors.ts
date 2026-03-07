//base app error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

//product not found error
export class ProductNotFoundError extends AppError {
  constructor(message: string = 'Product not found') {
    super(404, 'PRODUCT_NOT_FOUND', message);
  }
}

//product already sold error
export class ProductAlreadySoldError extends AppError {
  constructor(message: string = 'Product has already been sold') {
    super(409, 'PRODUCT_ALREADY_SOLD', message);
  }
}

//reseller price too low error
export class ResellerPriceTooLowError extends AppError {
  constructor(message: string = 'Reseller price is below minimum sell price') {
    super(400, 'RESELLER_PRICE_TOO_LOW', message);
  }
}

//unauthorized error
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, 'UNAUTHORIZED', message);
  }
}

//validation error
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, 'VALIDATION_ERROR', message);
  }
}
