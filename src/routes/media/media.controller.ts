import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import path from "path";
import envConfig from "src/shared/config";
import { UPLOAD_DIR } from "src/shared/constants/other.constant";
import { IsPublic } from "src/shared/decorators/auth.decorator";

@Controller('media')
export class MediaController {
  @Post('images/upload')
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 5 * 1024 * 1024
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        ]
      })
    )
    files: Array<Express.Multer.File>
  ) {
    return files.map((file) => ({
      url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`
    }))
  }

  @Get('static/:filename')
  @IsPublic()
  serverFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(path.resolve(UPLOAD_DIR, filename)), (error: any) => {
      if (error) {
        const notFound = new NotFoundException('File not found')
        res.status(notFound.getStatus()).json(notFound.getResponse())
      }
    })
  }
}