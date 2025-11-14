#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeLogger, NSObject)

RCT_EXTERN_METHOD(log:(NSString *)message)

@end

