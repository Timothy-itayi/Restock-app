import Foundation
import os.log

@objc(NativeLogger)
class NativeLogger: NSObject {
  @objc func log(_ message: String) {
    os_log("%@", log: .default, type: .info, message)
  }
}

