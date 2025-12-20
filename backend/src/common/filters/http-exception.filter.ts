import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre d'exception global
 * 
 * En production :
 * - Masque les détails techniques des erreurs
 * - Log les erreurs côté serveur uniquement
 * - Retourne des messages génériques aux utilisateurs
 * 
 * En développement :
 * - Affiche tous les détails pour le debug
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const isProduction = process.env.NODE_ENV === 'production';

        let status: number;
        let message: string;
        let errorDetails: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();

            if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = (errorResponse as any).message || exception.message;
                errorDetails = errorResponse;
            } else {
                message = errorResponse as string;
            }
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = isProduction ? 'Une erreur interne est survenue' : exception.message;

            // Log l'erreur complète côté serveur
            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Une erreur interne est survenue';
        }

        // Messages d'erreur génériques pour la production
        const productionMessages: Record<number, string> = {
            [HttpStatus.UNAUTHORIZED]: 'Authentification requise',
            [HttpStatus.FORBIDDEN]: 'Accès non autorisé',
            [HttpStatus.NOT_FOUND]: 'Ressource non trouvée',
            [HttpStatus.BAD_REQUEST]: 'Requête invalide',
            [HttpStatus.INTERNAL_SERVER_ERROR]: 'Une erreur interne est survenue',
            [HttpStatus.TOO_MANY_REQUESTS]: 'Trop de requêtes, veuillez réessayer plus tard',
        };

        // Log toutes les erreurs en production
        if (isProduction && status >= 500) {
            this.logger.error({
                status,
                path: request.url,
                method: request.method,
                message,
                timestamp: new Date().toISOString(),
            });
        }

        // Réponse selon l'environnement
        const responseBody = isProduction
            ? {
                statusCode: status,
                message: productionMessages[status] || message,
                timestamp: new Date().toISOString(),
                path: request.url,
            }
            : {
                statusCode: status,
                message: Array.isArray(message) ? message : [message],
                error: errorDetails,
                timestamp: new Date().toISOString(),
                path: request.url,
            };

        response.status(status).json(responseBody);
    }
}
