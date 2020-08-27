export const locations = {
  root: () => '/',
  proposal: (id: string = `:proposalId`) => '/proposal/' + id,
  wrapping: () => '/wrapping/',
  // home: () => '/home',

  // avatar: () => '/avatar',

  // creator: () => '/creator',
  // createAvatarSuccess: () => '/avatar-created',
  // claim: () => '/claim',
  // claimSuccess: () => '/claim-success',
  // minibio: () => '/minibio',
  // callback: () => '/callback',

  // selector: () => '/accounts'
}
