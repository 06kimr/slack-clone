import { convexAuth } from "@convex-dev/auth/server";
import KakaoProvider from "@auth/core/providers/kakao";
import GoogleProvider from "@auth/core/providers/google";
import GitHubProvider from "@auth/core/providers/github";
import {Password} from '@convex-dev/auth/providers/Password'
import {DataModel} from './_generated/dataModel'

const CustomPassword = Password<DataModel>({
  profile(params) {
    return{
      email: params.email as string,
      name: params.name as string,
    }
  }
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GoogleProvider({
      name: "google",
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    KakaoProvider({
      name: "kakao",
      clientId: process.env.AUTH_KAKAO_ID!,
      clientSecret: process.env.AUTH_KAKAO_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CustomPassword
  ],
});
