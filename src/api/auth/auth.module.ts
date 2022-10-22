import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { PassportModule } from '@nestjs/passport';
import { PassportJWTAccessTokenStrategy } from './passport-stategies/jwt-at';
import { PassportJWTRefreshTokenStrategy } from './passport-stategies/jwt-rt';
import { FirebaseModule } from '../../shared/firebase/firebase.module';

@Module({
  imports: [UserModule, SessionModule, PassportModule, FirebaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PassportJWTAccessTokenStrategy,
    PassportJWTRefreshTokenStrategy,
  ],
})
export class AuthModule {}
