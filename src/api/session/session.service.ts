import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { hashSync } from 'bcryptjs';
import { sign as jwtSign } from 'jsonwebtoken';
import { InjectModel } from 'nestjs-typegoose';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session)
    private readonly model: ReturnModelType<typeof Session>, // private readonly config: ConfigService,
  ) {}

  /**
   * Claim token for a user id
   * @param subscriber user_id string - user id
   * @returns
   */
  async claimToken(subscriber: string) {
    // Refresh token secret for this specific claim
    const rt_secret = this.generateRefreshTokenSecret(subscriber);

    // Store rt_secret in database
    await this.storeSessionToDatabase(subscriber, rt_secret);

    // Generate access and refresh tokens
    return this.generateAccessAndRefreshTokens(subscriber, rt_secret);
  }

  /**
   * Generate access and refresh token
   * @param subscriber user_id
   * @returns
   */
  public generateAccessAndRefreshTokens(subscriber: string, rt_secret: string) {
    const accessToken = jwtSign(
      { subscriber },
      'auth.at_secret',
      // TODO: Config service not working in test suite
      // this.config.get('auth.at_secret')
    );
    const refreshToken = jwtSign({ subscriber }, rt_secret);
    return { accessToken, refreshToken };
  }

  /**
   * Create session
   * @param subscriber user_id
   * @returns
   */
  public async storeSessionToDatabase(subscriber: string, rt_secret: string) {
    const session = await this.model.create({ subscriber, rt_secret });
    return session;
  }

  /**
   * Generate a new refresh token secret for a given user id
   * @param userId string - user id
   * @returns
   */
  private generateRefreshTokenSecret(userId: string) {
    return hashSync(userId + '-' + Date.now(), 10);
  }
}
