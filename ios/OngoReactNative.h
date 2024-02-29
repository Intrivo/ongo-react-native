
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNOngoReactNativeSpec.h"

@interface OngoReactNative : NSObject <NativeOngoReactNativeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface OngoReactNative : NSObject <RCTBridgeModule>
#endif

@end
