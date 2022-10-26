import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  /*
  |--------------------------------------------------------------------------
  | Database url
  |--------------------------------------------------------------------------
  |  The url of the database.
  |  Set this in your ".env" file.
  |  If not set, the default value is "mongodb://localhost:27017/rexy"
*/
  url: process.env.DATABASE_URL || 'mongodb://localhost:27017/rexy',

  /**
    |--------------------------------------------------------------------------
    | Test database url
    |--------------------------------------------------------------------------
    |  The url of the test database.
    |  If not set, the default value is "rexy-test"
   */
  test_url:
    process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/rexy-test',
}));
