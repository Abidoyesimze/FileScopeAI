from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
from .models import DatasetAnalysis
import mimetypes
from django.conf import settings
import pandas as pd
from django.core.files.storage import default_storage
from .tasks import process_dataset, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
import os
import uuid
import os

from .tasks import (
    process_dataset,
    load_dataset,  
    get_basic_statistics,
    analyze_data_quality,
    detect_anomalies,
    analyze_bias,
    generate_insights,
    create_visualizations,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE
)
from .tasks import process_dataset
from .filecoin_storage import FilecoinStorage
import logging
logger = logging.getLogger(__name__)

# ALLOWED_EXTENSIONS = {'.csv', '.json', '.xlsx', '.xls', '.parquet'}
# MAX_FILE_SIZE = 100 * 1024 * 1024  



# @api_view(['POST'])
# def upload_dataset(request):
#     """
#     Upload and process dataset synchronously
#     """
#     try:
#         user = request.user if request.user.is_authenticated else None
        
#         if 'file' not in request.FILES:
#             return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
#         file = request.FILES['file']
#         file_extension = os.path.splitext(file.name)[1].lower()
        
#         if file_extension not in ALLOWED_EXTENSIONS:
#             return Response(
#                 {'error': f'Unsupported file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if file.size > MAX_FILE_SIZE:
#             return Response(
#                 {'error': f'File too large. Maximum size: {MAX_FILE_SIZE//(1024*1024)}MB'},
#                 status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
#             )
        
#         try:
#             if file_extension == '.csv':
#                 pd.read_csv(file, nrows=5)
#             elif file_extension == '.json':
#                 pd.read_json(file, nrows=5)
#             elif file_extension in ['.xlsx', '.xls']:
#                 pd.read_excel(file, nrows=5)
#             file.seek(0)
#         except Exception as e:
#             return Response(
#                 {'error': f'Invalid file format: {str(e)}'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         file_path = default_storage.save(f'datasets/{uuid.uuid4()}_{file.name}', file)
        
#         analysis = DatasetAnalysis.objects.create(
#             user=user,
#             dataset_file=file_path,
#             status='pending'
#         )
        
#         # Process synchronously
#         try:
#             results = process_dataset(analysis.id)
            
#             # Optionally store on Filecoin
#             if hasattr(settings, 'FILECOIN_STORAGE'):
#                 filecoin = FilecoinStorage()
#                 storage_result = filecoin.upload_analysis_results(analysis.id, results)
#                 if storage_result['success']:
#                     analysis.analysis_cid = storage_result['cid']
#                     analysis.verification_url = storage_result['url']
#                     analysis.save()
            
#             return Response({
#                 'analysis_id': str(analysis.id),
#                 'status': 'completed',
#                 'results': results
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             return Response(
#                 {'error': f'Processing failed: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
            
#     except Exception as e:
#         return Response(
#             {'error': f'Upload failed: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
# @api_view(['GET'])
# def get_analysis_status(request, analysis_id):
#     """
#     Get analysis status and results
#     """
#     try:
#         analysis = DatasetAnalysis.objects.get(
#             id=analysis_id, 
#             user=request.user
#         )
        
#         response_data = {
#             'analysis_id': str(analysis.id),
#             'status': analysis.status,
#             'uploaded_at': analysis.uploaded_at.isoformat(),
#             'dataset_file': analysis.dataset_file.name if analysis.dataset_file else None,
#         }
        
#         if analysis.status == 'completed':
#             response_data['results'] = {
#                 'quality_score': analysis.quality_score,
#                 'anomaly_count': analysis.anomaly_count,
#                 'bias_score': analysis.bias_score,
#                 'dataset_size': analysis.dataset_size,
#                 'insights': analysis.key_insights,
#                 'visualization_data': analysis.visualization_data,
#                 'filecoin_storage': {
#                     'dataset_cid': analysis.dataset_cid,
#                     'analysis_cid': analysis.analysis_cid,
#                     'verification_url': analysis.verification_url
#                 }
#             }
#         elif analysis.status == 'failed':
#             response_data['error'] = 'Analysis failed. Please try uploading the dataset again.'
#         elif analysis.status == 'processing':
#             response_data['message'] = 'Analysis is still in progress. Please check back in a few minutes.'
        
#         return Response(response_data)
        
#     except DatasetAnalysis.DoesNotExist:
#         return Response(
#             {'error': 'Analysis not found or access denied'}, 
#             status=status.HTTP_404_NOT_FOUND
#         )
import os
import uuid
import logging
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings
from .models import DatasetAnalysis
from .filecoin_storage import FilecoinStorage  # Your custom Filecoin storage

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'.csv', '.json', '.xlsx', '.xls', '.parquet'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

@api_view(['POST'])
def upload_dataset(request):
    """
    Upload and process dataset synchronously
    
    Query Params:
    - include_visualizations: true/false (default false)
    
    Returns:
    {
        "analysis_id": "UUID",
        "status": "completed",
        "results": {
            "metrics": {...},
            "insights": {...}
        },
        "visualizations": {
            "available": ["dist_age", "corr_matrix"],
            "types": {"dist_age": "histogram", ...},
            "descriptions": {"dist_age": "Age distribution", ...},
            "included": false,
            "data": {base64_images}  # only if include_visualizations=true
        }
    }
    """
    try:
        user = request.user if request.user.is_authenticated else None
        
        # Validate file exists
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        file_extension = os.path.splitext(file.name)[1].lower()
        
        # Validate file type
        if file_extension not in ALLOWED_EXTENSIONS:
            return Response(
                {'error': f'Unsupported file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size
        if file.size > MAX_FILE_SIZE:
            return Response(
                {'error': f'File too large. Max size: {MAX_FILE_SIZE//(1024*1024)}MB'},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            )
        
        # Validate file content
        try:
            if file_extension == '.csv':
                pd.read_csv(file, nrows=5)
            elif file_extension == '.json':
                pd.read_json(file, nrows=5)
            elif file_extension in ['.xlsx', '.xls']:
                pd.read_excel(file, nrows=5)
            file.seek(0)  # Reset file pointer after validation
        except Exception as e:
            return Response(
                {'error': f'Invalid file content: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save file
        file_path = default_storage.save(f'datasets/{uuid.uuid4()}_{file.name}', file)
        
        # Create analysis record
        analysis = DatasetAnalysis.objects.create(
            user=user,
            dataset_file=file_path,
            status='pending'
        )
        
        try:
            # Process dataset (your existing processing function)
            from .tasks import process_dataset  # Import here to avoid circular imports
            results = process_dataset(analysis.id)
            
            # Prepare visualization response
            include_viz = request.query_params.get('include_visualizations', 'false').lower() == 'true'
            visualization_data = results.get('visualizations', {})
            
            response_data = {
                'analysis_id': str(analysis.id),
                'status': 'completed',
                'results': {
                    'metrics': results.get('metrics', {}),
                    'insights': results.get('insights', {})
                },
                'visualizations': {
                    'available': list(visualization_data.keys()),
                    'types': _get_visualization_types(visualization_data),
                    'descriptions': _get_visualization_descriptions(visualization_data),
                    'included': include_viz
                }
            }
            
            # Optionally include visualization data
            if include_viz:
                response_data['visualizations']['data'] = visualization_data
            
            # Store on Filecoin if configured
            if hasattr(settings, 'FILECOIN_STORAGE'):
                try:
                    filecoin = FilecoinStorage()
                    storage_result = filecoin.upload_analysis_results(analysis.id, results)
                    if storage_result['success']:
                        analysis.analysis_cid = storage_result['cid']
                        analysis.verification_url = storage_result['url']
                        analysis.save()
                except Exception as e:
                    logger.error(f"Filecoin storage failed: {str(e)}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
            logger.error(f"Processing failed: {str(e)}")
            return Response(
                {'error': f'Processing failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return Response(
            {'error': f'Upload failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def _get_visualization_types(visualizations):
    """Map visualization names to chart types"""
    type_mapping = {
        'distribution_': 'histogram',
        'correlation_': 'heatmap',
        'scatter_': 'scatter',
        'boxplot_': 'boxplot',
        'bar_': 'bar'
    }
    return {
        name: next(
            (v for k, v in type_mapping.items() if name.startswith(k)),
            'chart'
        )
        for name in visualizations.keys()
    }

def _get_visualization_descriptions(visualizations):
    """Generate human-readable descriptions"""
    desc_map = {
        'distribution_': 'Distribution of {col} values',
        'correlation_': 'Correlation matrix',
        'scatter_': '{x} vs {y} relationship',
        'boxplot_': '{col} distribution',
        'bar_': '{col} value counts'
    }
    return {
        name: next(
            (v.format(col=name.split('_')[-1]) 
            for k, v in desc_map.items() if name.startswith(k)),
            'Data visualization'
        )
        for name in visualizations.keys()
    }

@api_view(['GET'])
def list_user_analyses(request):
    """
    List all analyses for the authenticated user
    """
    try:
        analyses = DatasetAnalysis.objects.filter(user=request.user).order_by('-uploaded_at')
        
        page = request.GET.get('page', 1)
        per_page = min(int(request.GET.get('per_page', 10)), 50) 
        
        paginator = Paginator(analyses, per_page)
        page_obj = paginator.get_page(page)
        
        analyses_data = []
        for analysis in page_obj:
            analyses_data.append({
                'analysis_id': str(analysis.id),
                'status': analysis.status,
                'uploaded_at': analysis.uploaded_at.isoformat(),
                'dataset_size': analysis.dataset_size,
                'quality_score': analysis.quality_score,
                'anomaly_count': analysis.anomaly_count,
                'bias_score': analysis.bias_score,
                'has_filecoin_storage': bool(analysis.analysis_cid),
                'verification_url': analysis.verification_url
            })
        
        return Response({
            'analyses': analyses_data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve analyses: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_analysis(request, analysis_id):
    """
    Delete an analysis
    """
    try:
        analysis = DatasetAnalysis.objects.get(
            id=analysis_id, 
            user=request.user
        )
        
        if analysis.dataset_file:
            try:
                default_storage.delete(analysis.dataset_file.name)
            except Exception as e:
                pass
        
        analysis.delete()
        
        return Response({
            'message': 'Analysis deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except DatasetAnalysis.DoesNotExist:
        return Response(
            {'error': 'Analysis not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def get_public_analysis(request, analysis_cid):
    """
    Get public analysis results from Filecoin CID
    """
    try:
        # Find analysis by CID
        analysis = DatasetAnalysis.objects.filter(analysis_cid=analysis_cid).first()
        
        if not analysis:
            return Response(
                {'error': 'Analysis not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if analysis.status != 'completed':
            return Response(
                {'error': 'Analysis not completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'analysis_cid': analysis.analysis_cid,
            'dataset_cid': analysis.dataset_cid,
            'uploaded_at': analysis.uploaded_at.isoformat(),
            'dataset_size': analysis.dataset_size,
            'results': {
                'quality_score': analysis.quality_score,
                'anomaly_count': analysis.anomaly_count,
                'bias_score': analysis.bias_score,
                'insights': analysis.key_insights,
                'visualization_data': analysis.visualization_data,
            },
            'verification_url': analysis.verification_url,
            'filecoin_verified': True
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve public analysis: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def browse_public_datasets(request):
    """
    Browse public datasets with analysis results
    """
    try:
        analyses = DatasetAnalysis.objects.filter(
            status='completed',
            analysis_cid__isnull=False
        ).exclude(analysis_cid='').order_by('-uploaded_at')
        
        quality_min = request.GET.get('quality_min')
        if quality_min:
            analyses = analyses.filter(quality_score__gte=float(quality_min))
        
        bias_max = request.GET.get('bias_max')
        if bias_max:
            analyses = analyses.filter(bias_score__lte=float(bias_max))
        
        search = request.GET.get('search')
        if search:
            analyses = analyses.filter(
                Q(key_insights__icontains=search) |
                Q(dataset_size__icontains=search)
            )
        
        # Pagination
        page = request.GET.get('page', 1)
        per_page = min(int(request.GET.get('per_page', 20)), 50)
        
        paginator = Paginator(analyses, per_page)
        page_obj = paginator.get_page(page)
        
        datasets_data = []
        for analysis in page_obj:
            datasets_data.append({
                'analysis_cid': analysis.analysis_cid,
                'dataset_cid': analysis.dataset_cid,
                'uploaded_at': analysis.uploaded_at.isoformat(),
                'dataset_size': analysis.dataset_size,
                'quality_score': analysis.quality_score,
                'anomaly_count': analysis.anomaly_count,
                'bias_score': analysis.bias_score,
                'verification_url': analysis.verification_url,
                'summary': analysis.key_insights.get('summary', '') if analysis.key_insights else ''
            })
        
        return Response({
            'datasets': datasets_data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            },
            'filters_applied': {
                'quality_min': quality_min,
                'bias_max': bias_max,
                'search': search
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to browse datasets: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# @api_view(['GET'])
# def get_platform_stats(request):
#     """
#     Get platform statistics
#     """
#     try:
#         total_analyses = DatasetAnalysis.objects.count()
#         completed_analyses = DatasetAnalysis.objects.filter(status='completed').count()
#         failed_analyses = DatasetAnalysis.objects.filter(status='failed').count()
#         processing_analyses = DatasetAnalysis.objects.filter(status='processing').count()
        
#         # Filecoin storage stats
#         stored_on_filecoin = DatasetAnalysis.objects.filter(
#             analysis_cid__isnull=False
#         ).exclude(analysis_cid='').count()
        
#         # Quality stats
#         avg_quality = DatasetAnalysis.objects.filter(
#             quality_score__isnull=False
#         ).aggregate(avg_quality=models.Avg('quality_score'))['avg_quality']
        
#         return Response({
#             'total_datasets_analyzed': total_analyses,
#             'completed_analyses': completed_analyses,
#             'failed_analyses': failed_analyses,
#             'currently_processing': processing_analyses,
#             'stored_on_filecoin': stored_on_filecoin,
#             'average_quality_score': round(avg_quality, 2) if avg_quality else None,
#             'success_rate': round((completed_analyses / total_analyses * 100), 2) if total_analyses > 0 else 0
#         })
        
#     except Exception as e:
#         return Response(
#             {'error': f'Failed to retrieve platform stats: {str(e)}'}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(['GET'])
# def get_analysis_status(request, analysis_id):
#     """
#     Get analysis status and results
#     """
#     try:
#         analysis = get_object_or_404(DatasetAnalysis, id=analysis_id)
        
#         response_data = {
#             'analysis_id': str(analysis.id),
#             'status': analysis.status,
#             'uploaded_at': analysis.uploaded_at.isoformat(),
#             'file_name': os.path.basename(analysis.dataset_file.name),
#         }
        
#         if analysis.status == 'completed':
#             response_data['results'] = results
        
#         return Response(response_data)
        
#     except Exception as e:
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#  
#        )




@api_view(['GET'])
def get_analysis_status(request, analysis_id):
    try:
        analysis = get_object_or_404(DatasetAnalysis, id=analysis_id)
        
        response = {
            'metadata': {
                'analysis_id': str(analysis.id),
                'status': analysis.status,
                'uploaded_at': analysis.uploaded_at.isoformat(),
                'file_name': os.path.basename(analysis.dataset_file.name),
                'processing_time': getattr(analysis, 'processing_time', 'N/A'),
                'dimensions': {
                    'rows': getattr(analysis, 'rows_count', 0),
                    'columns': getattr(analysis, 'columns_count', 0)
                }
            }
        }

        if analysis.status == 'completed':
            # Get the complete stored analysis or empty dict if none
            full_analysis = getattr(analysis, 'full_analysis', {})
            visualization_data = getattr(analysis, 'visualization_data', {})
            
            results = {
                # 1. Dataset Summary/Metadata
                'dataset_profile': {
                    'data_types': full_analysis.get('data_types', {}),
                    'completeness': full_analysis.get('completeness', {}),
                    'sample_values': full_analysis.get('sample_values', {})
                },
                
                # 2. Anomaly Detection
                'anomalies': {
                    'count': getattr(analysis, 'anomaly_count', 0),
                    'critical': getattr(analysis, 'critical_anomalies', 0),
                    'moderate': getattr(analysis, 'moderate_anomalies', 0),
                    'method': full_analysis.get('anomaly_method', 'Isolation Forest'),
                    'examples': full_analysis.get('anomaly_examples', [])
                },
                
                # 3. Bias Assessment
                'bias': {
                    'score': getattr(analysis, 'bias_score', 100),
                    'assessment': "not assessed" if analysis.bias_score is None
                                else "high" if analysis.bias_score < 70
                                else "moderate" if analysis.bias_score < 85
                                else "low",
                    'imbalanced_fields': full_analysis.get('imbalanced_fields', {})
                },
                
                # 4. Quality Scoring
                'quality': {
                    'overall_score': getattr(analysis, 'quality_score', 100),
                    'components': {
                        'completeness': full_analysis.get('completeness_score', 100),
                        'duplicates': full_analysis.get('duplicate_percentage', 0),
                        'schema_issues': full_analysis.get('schema_violations', 0)
                    }
                },
                
                # 5-12. Other Analysis Components
                'advanced_analysis': {
                    'correlations': full_analysis.get('correlation_matrix', {}),
                    'red_flags': full_analysis.get('data_integrity_issues', []),
                    'nlp_summary': full_analysis.get('text_analysis', {}),
                    'cluster_analysis': full_analysis.get('cluster_results', {})
                },
                
                # Visualization Handling
                'visualizations': {
                    'available': list(visualization_data.keys()),
                    'include_data': False  # Default to not include heavy base64
                }
            }
            
            # Optionally include visualization data if requested
            if request.query_params.get('include_visualizations'):
                results['visualizations']['data'] = visualization_data
                results['visualizations']['include_data'] = True
            
            response['results'] = results
        
        return Response(response)
        
    except Exception as e:
        logger.error(f"Error fetching analysis {analysis_id}: {str(e)}")
        return Response(
            {'error': f"Could not retrieve analysis: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )