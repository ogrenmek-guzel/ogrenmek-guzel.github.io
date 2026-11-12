// Turns each page of a PDF into a PNG picture, using macOS's own PDF engine (PDFKit).
// Used by tools/build.py so PDFs can be shown inside the app with a back button
// (on the iPad, a PDF opened directly fills the screen with no way back).
//
// Usage: pdf_pages <input.pdf> <output folder> [width in pixels, default 1400]
// Writes page-1.png, page-2.png, ... and prints the page count.
import AppKit
import Foundation
import PDFKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write("usage: pdf_pages <input.pdf> <output folder> [width]\n".data(using: .utf8)!)
    exit(2)
}
let input = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
let width = CGFloat(args.count > 3 ? (Double(args[3]) ?? 1400) : 1400)

guard let doc = PDFDocument(url: input) else {
    FileHandle.standardError.write("cannot open PDF\n".data(using: .utf8)!)
    exit(1)
}
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let space = CGColorSpace(name: CGColorSpace.sRGB)!

for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let scale = width / box.width
    let w = Int((box.width * scale).rounded()), h = Int((box.height * scale).rounded())
    guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                              space: space, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { exit(1) }
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.interpolationQuality = .high
    ctx.scaleBy(x: scale, y: scale)
    ctx.translateBy(x: -box.origin.x, y: -box.origin.y)
    page.draw(with: .mediaBox, to: ctx)
    guard let image = ctx.makeImage(),
          let png = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { exit(1) }
    try png.write(to: outDir.appendingPathComponent("page-\(i + 1).png"))
}
print(doc.pageCount)
