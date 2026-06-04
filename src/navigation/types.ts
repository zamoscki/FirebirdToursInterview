import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Posts: undefined;
  Details: { postId: number };
};

export type PostsScreenProps = NativeStackScreenProps<RootStackParamList, 'Posts'>;
export type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
